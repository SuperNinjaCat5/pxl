<svelte:head>
  <title>Pixel - Bitvualt</title>
</svelte:head>

<!-- <script>
  import { page } from '$app/stores';
  import { signOut } from '@auth/sveltekit/client';

  let canvasWidth = 512
  let canvasHeight = 512

  let canvas;
  let ctx;

  
  function drawCanvas() {
    if (!ctx) return;
    
    ctx.fillStyle = "#fff";
    
    
    for (let pixel of dataset) {
    if (pixel.x < canvasWidth && pixel.y < canvasHeight) {
      ctx.fillStyle = palette[pixel.color] || "#000";
      ctx.fillRect(pixel.x * pixelSize, pixel.y * pixelSize, pixelSize, pixelSize);
    }
  }
  }

</script> -->

<script lang="ts">
  import { page } from '$app/stores';
  import { signOut } from '@auth/sveltekit/client';
  import { onMount } from 'svelte';

  // your sample pixel data
  const pixels = [{ x: 1, y: 1, color: 'red' },{ x: 3, y: 1, color: 'blue' },{ x: 100, y: 1, color: 'red' },{ x: 8, y: 6, color: 'blue' }];

  // canvas setup
  let canvas: HTMLCanvasElement;
  const width = 512;  // total grid width
  const height = 512; // total grid height
  const pixelSize = 5; // each pixel will be 20×20 screen pixels

  onMount(() => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // optional background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width * pixelSize, height * pixelSize);

    // draw each pixel
    for (const { x, y, color } of pixels) {
      ctx.fillStyle = color;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  });
</script>

<div class="navbar">
  <div class="nav-left">
    <a href="/home"><button>Home</button></a>
    <a href="/shop"><button>Shop</button></a>
  </div>

  <div class="nav-right">
    {#if $page.data.session}
      <span class="account-navbar">Signed in as {$page.data.session.user?.email}</span>
    {:else}
      <span class="account-navbar">Not signed in</span>
    {/if}
    <button on:click={() => signOut()}>Sign out</button>
  </div>
</div>

<div class="page-content">
  <canvas
    bind:this={canvas}
    style="border:1px solid black; image-rendering: pixelated;"
    on:click={handleClick}>
  </canvas>
</div>
