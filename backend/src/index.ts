// src/index.ts
import express from 'express';
import type { Application, Request, Response } from 'express';
import { WIDTH, HEIGHT, upsertPixel, selectPixelsInRect } from './db';
import cors from 'cors';

const app: Application = express();
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173', // Svelte dev server
  // methods: ['GET','POST','OPTIONS'],
  // allowedHeaders: ['Content-Type'],
}));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/', (_req, res) => res.json({ ok: true }));

// place or overwrite a pixel
app.post('/place', (req: Request, res: Response) => {
  const { x, y, color, placed_by } = req.body ?? {};
  if (![x, y].every(n => Number.isInteger(n))) {
    return res.status(400).json({ error: 'x and y must be integers' });
  }
  if (typeof placed_by !== 'string' || !placed_by) {
    return res.status(400).json({ error: 'placed_by (user id) required' });
  }
  if (typeof color !== 'string' || !color) {
    return res.status(400).json({ error: 'color is required'})
  }
  if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) {
    return res.status(400).json({ error: 'out of bounds' });
  }
  upsertPixel.run({
    x, y,
    color,
    placed_by,
    placed_at: Date.now()
  });
  res.json({ ok: true });
});

// fetch a rectangle of pixels (sparse result)
app.get('/pixels', (req: Request, res: Response) => {
  const x0 = parseInt(String(req.query.x0 ?? '0'), 10);
  const x1 = parseInt(String(req.query.x1 ?? WIDTH), 10);
  const y0 = parseInt(String(req.query.y0 ?? '0'), 10);
  const y1 = parseInt(String(req.query.y1 ?? HEIGHT), 10);

  const rows = selectPixelsInRect.all({ x0, x1, y0, y1 });
  const header = {
    width: WIDTH,
    height: HEIGHT,
    generated_at: Date.now() 
  }



  res.json([header, rows]); // [{x,y,color}, ...] only returns set pixels
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
