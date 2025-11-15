// @ts-ignore: no type declarations for better-sqlite3
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dbPath = process.env.DB_PATH ?? "pxl.sqlite";
console.log("Using DB at", dbPath);

// make sure the directory exists
const dir = path.dirname(dbPath);
if (dir && dir !== "." && !fs.existsSync(dir)) {
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
  api_key      TEXT,
  admin_level  INTEGER NOT NULL
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

export const addUser = db.prepare(`
  INSERT INTO users (email, api_key, admin_level)
  VALUES (:email, :api_key, :user_permission_level)
`);

export const getUserFromKey = db.prepare(`
  SELECT * FROM users WHERE api_key = :api_key
`);

export const getUserFromEmail = db.prepare(`
  SELECT * FROM users WHERE email = :email
`);

export const selectPixelsInRect = db.prepare(`
SELECT x, y, color FROM pixels
WHERE x BETWEEN @x0 AND @x1 AND y BETWEEN @y0 AND @y1
`);