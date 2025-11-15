import type { RequestHandler } from "@sveltejs/kit";
import { HEIGHT, WIDTH, selectPixelsInRect } from "$lib/server/db";

export const GET: RequestHandler = async ({ url }) => {
    console.log('got request for pixels');
    const qp = url.searchParams;

    const x0 = qp.has('x0') ? Number.parseInt(qp.get('x0')!, 10) : undefined;
    const x1 = qp.has('x1') ? Number.parseInt(qp.get('x1')!, 10) : undefined;
    const y0 = qp.get('y0') ? Number.parseInt(qp.get('y0')!, 10) : undefined;
    const y1 = qp.get('y1') ? Number.parseInt(qp.get('y1')!, 10) : undefined;

    const rows = selectPixelsInRect({ x0, x1, y0, y1 });
    const header = {
        width: WIDTH,
        height: HEIGHT,
        generated_at: Date.now()
    };

    console.log('returning', header, rows);

    return new Response(JSON.stringify([header, rows]));
}