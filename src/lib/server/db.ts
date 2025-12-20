// @ts-ignore: no type declarations for better-sqlite3
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import base from '$lib/server/airtable';

const dbPath = process.env.DB_PATH ?? 'pxl.sqlite';
console.log('Using DB at', dbPath);

// make sure the directory exists
const dir = path.dirname(dbPath);
if (dir && dir !== '.' && !fs.existsSync(dir)) {
	fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(dbPath);

export const WIDTH = 512;
export const HEIGHT = 512;

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

db.exec(`
CREATE TABLE IF NOT EXISTS pixels (
  x          INTEGER NOT NULL,
  y          INTEGER NOT NULL,
  color      TEXT NOT NULL,
  placed_by  TEXT    NOT NULL,
  placed_at  INTEGER NOT NULL,
  PRIMARY KEY (x, y)
) WITHOUT ROWID;

CREATE INDEX IF NOT EXISTS idx_pixels_placed_at ON pixels(placed_at);
CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  email        TEXT NOT NULL,
  slack_id     TEXT NOT NULL,
  is_ship_edit BOOLEAN NOT NULL DEFAULT 0,
  is_shop_edit BOOLEAN NOT NULL DEFAULT 0,
  is_canvas_mod BOOLEAN NOT NULL DEFAULT 0,
  is_admin BOOLEAN NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_pixels_placed_at ON pixels(placed_at);
`);

export const upsertPixel = db.prepare(`
INSERT INTO pixels (x, y, color, placed_by, placed_at)
VALUES (@x, @y, @color, @placed_by, @placed_at)
ON CONFLICT(x, y) DO UPDATE SET
  color = excluded.color,
  placed_by = excluded.placed_by,
  placed_at = excluded.placed_at
`);

export const selectPixelsInRect = db.prepare(`
SELECT x, y, color FROM pixels
WHERE x BETWEEN @x0 AND @x1 AND y BETWEEN @y0 AND @y1
`);

function mapPermissions(permissions: string[] = []) {
	return {
		is_admin: permissions.includes('Admin'),
		is_supaadmin: permissions.includes('SupaAdmin'),
		is_canvas_mod: permissions.includes('Canvas_Mod'),
		is_shop_edit: permissions.includes('Shop_Editor'),
		is_ship_edit: permissions.includes('Shipwright')
	};
}

export async function addUser(user: { email: string; slack_id: string; name?: string }) {
	const existing = await getUserFromEmail(user.email);
	if (existing) return existing;

	const record = await base('Users').create(user);
	return { id: record.id, ...record.fields };
}

export async function getUserFromEmail(email: string) {
	const records = await base('Users')
		.select({
			filterByFormula: `{email} = '${email.replace("'", "\\'")}'`,
			maxRecords: 1
		})
		.firstPage();

	if (records.length === 0) return null;

	const fields = records[0].fields;
	const permissions = (fields.Permissions as string[]) || [];

	return {
		id: records[0].id,
		email: fields.email as string,
		slack_id: fields.slack_id as string,
		...mapPermissions((permissions as string[]) || [])
	};
}

export async function numberOfPixels(slack_id: string, add_pixel: boolean = false) {
	const records = await base('Users')
		.select({
			filterByFormula: `{slack_id} = '${slack_id.replace("'", "\\'")}'`,
			maxRecords: 1
		})
		.firstPage();

	if (records.length === 0) return null;

	const record = records[0];
	let pixels_placed = (record.fields.pixels_placed as number) || 0;

	if (add_pixel) {
		pixels_placed += 1;
		await base('Users').update(record.id, {
			pixels_placed: pixels_placed
		});
	}

	return pixels_placed;
}

export async function getAllUsers() {
	const records = await base('Users').select().all();

	return records.map((r) => {
		const fields = r.fields;
		const permissions = (fields.Permissions as string[]) || [];
		return {
			id: r.id,
			email: fields.email,
			slack_id: fields.slack_id,
			...mapPermissions(permissions)
		};
	});
}
