import type { RequestHandler } from "@sveltejs/kit";
import { subscribe } from "$lib/server/pixelStream";
import type { PixelEvent } from "$lib/server/pixelStream";

export const GET: RequestHandler = async ({ request }) => {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let isClosed = false;

      // notify client we're connected (SSE comment)
      controller.enqueue(encoder.encode(': connected\n\n'));

      // subscribe once for this client
      const unsubscribe = subscribe((data: PixelEvent) => {
        // Skip if controller is already closed
        if (isClosed) return;
        
        const payload = JSON.stringify({ type: 'pixel_update', ...data });
        const chunk = `data: ${payload}\n\n`; // valid SSE frame
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch (err) {
          console.error('SSE enqueue failed', err);
          // Controller is closed, unsubscribe to prevent future errors
          isClosed = true;
          unsubscribe();
        }
      });

      // periodic heartbeat to keep some proxies from closing connection
      const heartbeatId = setInterval(() => {
        if (isClosed) return;
        try { controller.enqueue(encoder.encode(': heartbeat\n\n')); }
        catch (e) { 
          // Controller is closed, mark it and clean up
          isClosed = true;
          clearInterval(heartbeatId);
          unsubscribe();
        }
      }, 15000);

      const onAbort = () => {
        isClosed = true;
        unsubscribe();
        clearInterval(heartbeatId);
        try { controller.close(); } catch {}
      };
      request.signal.addEventListener?.('abort', onAbort);

      // store cleanup for cancel()
      (controller as any)._cleanup = () => {
        request.signal.removeEventListener?.('abort', onAbort);
        isClosed = true;
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