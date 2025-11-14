<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  
  const URL = 'http://localhost:3000'

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

  let error: String = '';

  let currentColor: String = 'blue';

  // canvas setup
  let canvas: HTMLCanvasElement;
  const width = 512;  // total grid width
  const height = 512; // total grid height
  const pixelSize = 5;

  onMount(async () => {
    try {
      const res = await fetch(`${URL}/pixels`);
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

    canvas.width = (width * pixelSize);
    canvas.height = (height * pixelSize);

    // background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width * pixelSize, height * pixelSize);

    // draw each pixel
    for (const { x, y, color } of pixels) {
      ctx.fillStyle = color;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  });

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

    return { x, y };
  }

  async function placePixel(e: MouseEvent | PointerEvent) {
    const { x, y } = canvasToPixel(e);

    if (x < 0 || y < 0 || x >= width || y >= height) return;

    // send request to api to place pixel
    try {
        const res = await fetch(`${URL}/place`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json' },
          body: JSON.stringify({ x, y, color: currentColor, placed_by: $page.data?.session?.user?.email ?? 'null'})
        });

        if (!res.ok) {
            console.error('Unable to place pixel:', await res.text())
        }
        console.log(`placed pixel at (${x}, ${y})`)
    } catch (err) {
        console.error('network error:', err)
    }
  }
</script>

<div class="page-content">
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
  </div>
  <!--  -->
  <!-- ^ was inside of that but not needed yet -->
   {/if}
</div>