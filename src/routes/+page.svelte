<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let pixels: Map<string, {color: string, link?: string}> = new Map();
  const unitSize = 10;

  onMount(() => {
    ctx = canvas.getContext('2d')!;
    const saved = localStorage.getItem('pixels');
    if (saved) {
      pixels = new Map(JSON.parse(saved));
    }
    render();
  });

  function render() {
    ctx.clearRect(0, 0, 1000, 1000);
    for (let [key, data] of pixels) {
      const [x, y] = key.split(',').map(Number);
      ctx.fillStyle = data.color;
      ctx.fillRect(x * unitSize, y * unitSize, unitSize, unitSize);
    }
  }

  function handleClick(event: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / unitSize);
    const y = Math.floor((event.clientY - rect.top) / unitSize);
    const key = `${x},${y}`;
    if (pixels.has(key)) {
      const link = pixels.get(key)!.link;
      if (link) {
        window.open(link, '_blank');
      }
    } else {
      const color = prompt('Enter color (hex or name):');
      if (color) {
        const link = prompt('Enter link (optional):');
        pixels.set(key, { color, link: link || undefined });
        localStorage.setItem('pixels', JSON.stringify(Array.from(pixels)));
        render();
      }
    }
  }
</script>

<canvas bind:this={canvas} width="1000" height="1000" on:click={handleClick} style="border: 1px solid black; cursor: pointer;"></canvas>
