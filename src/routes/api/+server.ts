import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
  return new Response(JSON.stringify('OK'), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
