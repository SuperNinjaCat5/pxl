// index.ts
import express from 'express';
import type { Application, Request, Response } from 'express';

const app: Application = express();
const port = 3000;

app.get('/', (_req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
