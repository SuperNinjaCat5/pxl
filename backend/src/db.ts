// src/db.ts
import Database from 'better-sqlite3';
import path from 'node:path';

export const WIDTH = 512;
export const HEIGHT = 512;

const db = new Database(path.join(process.cwd(), 'pxl.sqlite'));
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
  user_id      INTEGER NOT NULL,
  email        TEXT NOT NULL,
  api_key      TEXT,
  admin_level  INTEGER NOT NULL,
  PRIMARY KEY (user_id)
) WITHOUT ROWID;

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
INSERT INTO users (email,api_key,admin_level)`)

export const getUserFromKey = db.prepare(`
SELECT api_key FROM pixels`)

export const getUserFromEmail = db.prepare(`
SELECT email FROM pixels`)

export const selectPixelsInRect = db.prepare(`
SELECT x, y, color FROM pixels
WHERE x BETWEEN @x0 AND @x1 AND y BETWEEN @y0 AND @y1
`);
