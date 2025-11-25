<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';

  export let editable = true;

  type Pixel = {
    x: number;
    y: number;
    color: string;
  };

  type Header = {
    width: number;
    height: number;
    generated_at: number;
  };

  type PixelResponse = [
    Header,
    Pixel[]
  ];

  // let pixels = [{ x: 1, y: 1, color: 'red' },{ x: 3, y: 1, color: 'blue' },{ x: 100, y: 1, color: 'red' },{ x: 8, y: 6, color: 'blue' }];
  
  let header: Header | null = null;
  let pixels: Pixel[] = [];

  let error: string = '';

  let currentColor: string = 'blue';

  let sse: EventSource | null = null;

  // canvas setup
  let canvas: HTMLCanvasElement;
  const width = 512;  // total grid width
  const height = 512; // total grid height

  export let pixelSize: number = 5; 

  // guard value used for sizing/drawing so we never use NaN/Infinity/<=0
  $: safePixelSize = Number.isFinite(pixelSize) && pixelSize > 0 ? pixelSize : 5;

  function drawPixel(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
  }

  let mounted: boolean = false;

  onMount(async () => {
    try {
      const res = await fetch(`/api/pixels/get`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json = (await res.json()) as PixelResponse;

      header = json[0];
      pixels = json[1];

      console.log('header:', header);
      console.log('pixels:', pixels);
    } catch (err) {
      error = String(err)
      console.error('Fetch failed:', err);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    mounted = true;

    canvas.width = (width * safePixelSize);
    canvas.height = (height * safePixelSize);

    // background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width * pixelSize, height * pixelSize);

    // draw each pixel
    for (const { x, y, color } of pixels) {
      drawPixel(ctx, x, y, color);
    }

    // open SSE after first paint to avoid SSR/hydration issues
    requestAnimationFrame(() => {
      sse = new EventSource('/api/pixels/stream');
      sse.onmessage = (e) => {
        try {
          console.log('New stream data:', e.data);
          const msg = JSON.parse(e.data);
          const x = msg.x;
          const y = msg.y;
          const color = msg.color;
          // Update local pixels state so redraws (eg. on zoom) include this pixel
          const found = pixels.findIndex(p => p.x === x && p.y === y);
          if (found >= 0) {
            pixels[found] = { x, y, color };
            pixels = pixels; // trigger Svelte reactivity
          } else {
            pixels = [...pixels, { x, y, color }];
          }
          // draw immediately for live feedback
          drawPixel(ctx, x, y, color);
        } catch (err) {
          console.error('SSE parse/draw error', err);
        }
      };

      // don't aggressively close on generic errors during load; let browser retry
      sse.onerror = (e) => {
        console.warn('Stream error (non-fatal):', e, 'readyState=', sse?.readyState);
      };
    });
  });

  onDestroy(() => {
    try { sse?.close(); } catch {}
    sse = null;
  });

  // react to pixelSize or pixels changes and redraw when mounted
  $: if (mounted && canvas) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = (width * safePixelSize);
      canvas.height = (height * safePixelSize);
      // background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width * pixelSize, height * pixelSize);
      // draw pixels
      for (const { x, y, color } of pixels) {
        drawPixel(ctx, x, y, color);
      }
    }
  }

  function canvasToPixel(e: MouseEvent | PointerEvent) {
    const rect = canvas.getBoundingClientRect();

    // scale from CSS size → internal canvas size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let x = Math.floor((e.clientX - rect.left) * scaleX);
    let y = Math.floor((e.clientY - rect.top) * scaleY);

    x = Math.round(x/pixelSize);
    y = Math.round(y/pixelSize);

    console.log(`Found x and y: (${x}, ${y})`);
    
    if (editable == false) {console.log(`In read-only canvas mode, so not sending request to place pixel`)}

    return { x, y };
  }

  async function placePixel(e: MouseEvent | PointerEvent) {
    const { x, y } = canvasToPixel(e);
    
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    
    if (editable == false) {return;} // Stop user from placing if the canvas is not editable

    // send request to api to place pixel

    try {
        const res = await fetch(`/api/pixels/place`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json' },
          body: JSON.stringify({ x, y, color: currentColor, placed_by: $page.data?.session?.user?.email ?? 'null'})
        });

        if (!res.ok) {
            console.error('Unable to place pixel:', await res.text())
        }
        console.log(`placed pixel at (${x}, ${y})`)

        // Optimistically update local pixels so subsequent redraws include it
        const existing = pixels.findIndex(p => p.x === x && p.y === y);
        if (existing >= 0) {
          pixels[existing] = { x, y, color: currentColor };
          pixels = pixels;
        } else {
          pixels = [...pixels, { x, y, color: currentColor }];
        }
    } catch (err) {
        console.error('network error:', err)
    }
  }
</script>


{#if error}
  <p>Error: {error}</p>
{:else}
<div>
  <canvas
    bind:this={canvas}
    style="image-rendering: pixelated;
          width: {width * pixelSize}px;
          height: {height * pixelSize}px;"
    class='canvas'
    on:click={placePixel}>
  </canvas>

  <!-- <input bind:value={pixelSize}> -->
</div>
  {/if}