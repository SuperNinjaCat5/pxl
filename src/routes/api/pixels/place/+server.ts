import type { RequestHandler } from "@sveltejs/kit";
import { HEIGHT, WIDTH, upsertPixel } from "$lib/server/db";

export const POST: RequestHandler = async ({ request }) => {
  const body = (await request.json()) as {
    x?: number;
    y?: number;
    color?: string;
  } | undefined;

  const { x, y, color } = body ?? {};
  const placed_by: String = 'test@hackclub.com' // this will be from auth

  console.log(`got request from ${placed_by} to place a ${color} pixel at (${x}, ${y})`);

  if (x == null || y == null || !Number.isInteger(x) || !Number.isInteger(y)) {
    return new Response(JSON.stringify({error: 'x and y must be integers'}), {
        status: 400,
        headers: {
            "Content-Type": "application/json"
        }
    });
  }
  if (typeof placed_by !== 'string' || !placed_by) {
    return new Response(JSON.stringify({error: 'placed_by (user id) required'}), {
        status: 400,
        headers: {
            "Content-Type": "application/json"
        }
    });
  }
  if (typeof color !== 'string' || !color) {
    return new Response(JSON.stringify({error: 'color is required'}), {
        status: 400,
        headers: {
            "Content-Type": "application/json"
        }
    });
  }
  if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) {
    return new Response(JSON.stringify({error: 'out of bounds'}), {
        status: 400,
        headers: {
            "Content-Type": "application/json"
        }
    })
  }

  upsertPixel.run({
    x, y,
    color,
    placed_by,
    placed_at: Date.now()
  });

  console.log('placed pixel');
  
  
  return new Response(JSON.stringify({ok: true}), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
};