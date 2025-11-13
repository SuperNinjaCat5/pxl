<svelte:head>
  <title>Pixel - Bitvualt</title>
</svelte:head>

<script lang="ts">
  import { onMount } from 'svelte';
  import Header from '$lib/components/Header.svelte';

  // your sample pixel data
  const pixels = [{ x: 1, y: 1, color: 'red' },{ x: 3, y: 1, color: 'blue' },{ x: 100, y: 1, color: 'red' },{ x: 8, y: 6, color: 'blue' }];

  // canvas setup
  let canvas: HTMLCanvasElement;
  const width = 512;  // total grid width
  const height = 512; // total grid height
  const pixelSize = 3; // each pixel will be 20×20 screen pixels

  onMount(() => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width; // gpt claims this is the internal size, and to set it like this
    canvas.height = height; // but I think if we do this to make it height * pixel size

    // background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width * pixelSize, height * pixelSize);

    // draw each pixel
    for (const { x, y, color } of pixels) {
      ctx.fillStyle = color;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  });
</script>

<Header></Header>

<div class="page-content">
  <canvas
    bind:this={canvas}
    style="border:1px solid black;
           image-rendering: pixelated;
           width: {width * pixelSize}px;
           height: {height * pixelSize}px;">
  </canvas> 
  <!-- on:click={handleClick}> -->
  <!-- ^ was inside of that but not needed yet -->
</div>
