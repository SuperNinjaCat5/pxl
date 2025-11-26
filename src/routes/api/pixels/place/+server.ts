import type { RequestHandler } from './$types';
import { HEIGHT, WIDTH, upsertPixel } from '$lib/server/db';
import { broadcast } from '$lib/server/pixelStream';

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export const POST: RequestHandler = async (event) => {
  const session = await event.locals.auth();

  // Require login
  if (!session || !session.user?.email) {
    return jsonError('Unauthorized', 401);
  }

  const { request } = event;
  const body = (await request.json()) as
    | {
        x?: number;
        y?: number;
        color?: string;
      }
    | undefined;

  const { x, y, color } = body ?? {};

  if (x == null || y == null || !Number.isInteger(x) || !Number.isInteger(y)) {
    return jsonError('x and y must be integers', 400);
  }
  if (typeof color !== 'string' || !color) {
    return jsonError('color is required', 400);
  }
  if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) {
    return jsonError('out of bounds', 400);
  }

  const placed_by = session.user.email;

  try {
    upsertPixel.run({
      x,
      y,
      color,
      placed_by,
      placed_at: Date.now()
    });

    broadcast({
      x,
      y,
      color,
      placed_by
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('DB error in /api/pixels/place:', err);
    return jsonError('internal error', 500);
  }
};
