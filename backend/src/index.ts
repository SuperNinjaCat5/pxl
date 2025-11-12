// src/index.ts
import express from 'express';
import type { Application, Request, Response } from 'express';
import { WIDTH, HEIGHT, upsertPixel, selectPixelsInRect } from './db';

const app: Application = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/', (_req, res) => res.json({ ok: true }));

// place or overwrite a pixel
app.post('/place', (req: Request, res: Response) => {
  const { x, y, color, placed_by } = req.body ?? {};
  if (![x, y, color].every(n => Number.isInteger(n))) {
    return res.status(400).json({ error: 'x, y, color must be integers' });
  }
  if (typeof placed_by !== 'string' || !placed_by) {
    return res.status(400).json({ error: 'placed_by (user id) required' });
  }
  if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) {
    return res.status(400).json({ error: 'out of bounds' });
  }
  upsertPixel.run({
    x, y,
    color: color & 0xff, // palette index
    placed_by,
    placed_at: Math.floor(Date.now() / 1000)
  });
  res.json({ ok: true });
});

// fetch a rectangle of pixels (sparse result)
app.get('/pixels', (req: Request, res: Response) => {
  const x0 = parseInt(String(req.query.x0 ?? '0'), 10);
  const x1 = parseInt(String(req.query.x1 ?? WIDTH - 1), 10);
  const y0 = parseInt(String(req.query.y0 ?? '0'), 10);
  const y1 = parseInt(String(req.query.y1 ?? HEIGHT - 1), 10);

  const rows = selectPixelsInRect.all({ x0, x1, y0, y1 });
  res.json(rows); // [{x,y,color}, ...] only returns set pixels
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
