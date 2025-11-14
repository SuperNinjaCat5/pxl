// src/index.ts
import express from 'express';
import type { Application, Request, Response } from 'express';
import { WIDTH, HEIGHT, upsertPixel, selectPixelsInRect, getUserFromKey, getUserFromEmail, addUser } from './db';
import cors from 'cors';

const app: Application = express();
app.use(express.json());

interface User { // chatgpt to fix ts bs
  user_id: number;
  email: string;
  api_key: string;
  admin_level: number;
}

app.use(cors({
  origin: 'http://localhost:5173', // Svelte dev server
  // methods: ['GET','POST','OPTIONS'],
  // allowedHeaders: ['Content-Type'],
}));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/', (_req, res) => res.json({ ok: true }));

// place or overwrite a pixel
app.post('/pixels/place', (req: Request, res: Response) => {
  const { x, y, color, placed_by } = req.body ?? {};
  console.log(`got request from ${placed_by} to place a ${color} pixel at (${x}, ${y})`);

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

  console.log('placed pixel');
  res.json({ ok: true });
});

// fetch a rectangle of pixels (sparse result)
app.get('/pixels/get', (req: Request, res: Response) => {
  console.log('got request for pixels');
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

  console.log('returning', header, rows);
  res.json([header, rows]); // [{x,y,color}, ...] only returns set pixels
});

app.post('/users/new', (req: Request, res: Response) => { // TESTING ONLY
  const { email, api_key } = req.body ?? {};
  const user_permission_level = 0
  console.log('got request for new user');
  
  var existingUser = getUserFromEmail.get({ email });
  if (existingUser != null) { // Check if user exists
    console.log('user exists')
    res.json({ok: false, error: 'user exists'})
  }
  existingUser = null

  addUser.run({email,api_key,user_permission_level})
  console.log('Added user')
  res.json({ok: true, api_key: api_key}) // Return api key

});

app.get('/users/get', (req: Request, res: Response) => {
  const email = req.query.email as string;
  const api_key = req.query.api_key as string;

  const userK = getUserFromEmail.get({ email }) as User | undefined;

  if (!userK || userK.admin_level <= -1) {
    console.log(userK);
    return res.json({ ok: false, error: 'no permission' });
  }

  res.json({ ok: true, user: userK });
});


const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
