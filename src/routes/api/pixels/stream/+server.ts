import type { RequestHandler } from "@sveltejs/kit";
import { subscribe } from "$lib/server/pixelStream";
import type { PixelEvent } from "$lib/server/pixelStream";

export const GET: RequestHandler = async ({ request }) => {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // notify client we're connected (SSE comment)
      controller.enqueue(encoder.encode(': connected\n\n'));

      // subscribe once for this client
      const unsubscribe = subscribe((data: PixelEvent) => {
        const payload = JSON.stringify({ type: 'pixel_update', ...data });
        const chunk = `data: ${payload}\n\n`; // valid SSE frame
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch (err) {
          console.error('SSE enqueue failed', err);
        }
      });

      // periodic heartbeat to keep some proxies from closing connection
      const heartbeatId = setInterval(() => {
        try { controller.enqueue(encoder.encode(': heartbeat\n\n')); }
        catch (e) { /* ignore */ }
      }, 15000);

      const onAbort = () => {
        unsubscribe();
        clearInterval(heartbeatId);
        try { controller.close(); } catch {}
      };
      request.signal.addEventListener?.('abort', onAbort);

      // store cleanup for cancel()
      (controller as any)._cleanup = () => {
        request.signal.removeEventListener?.('abort', onAbort);
        unsubscribe();
        clearInterval(heartbeatId);
      };
    },

    cancel(reason) {
      if ((this as any)._cleanup) (this as any)._cleanup();
      console.log('SSE stream cancelled:', reason);
    }
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no"
    }
  });
};