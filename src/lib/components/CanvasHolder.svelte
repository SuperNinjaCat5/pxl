<script lang="ts">
  import Canvas from '$lib/components/Canvas.svelte';

  let pixelSizeConstant: number = 5;
  let pixelSize: number = 5;
  let zoom: number = 1;

  function onWheel(event: WheelEvent) {
    event.preventDefault();

    // do stuff with zoom here
    zoom = zoom + 0.001 * -event.deltaY;

    // clamp zoom to a reasonable range to avoid tiny/huge pixelSize
    zoom = Math.max(0.2, Math.min(6, zoom));

    // derive pixelSize and ensure it's a positive finite number
    const computed = pixelSizeConstant * zoom;
    pixelSize = Number.isFinite(computed)
      ? Math.max(1, Number(computed.toFixed(8)))
      : pixelSizeConstant;

    console.log('New zoom:', zoom, 'pixelSize:', pixelSize);
  }
</script>

<div on:wheel={onWheel} class="canvas-holder">
  <Canvas {pixelSize}></Canvas>
</div>
