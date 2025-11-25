<script lang="ts">
  import Canvas from '$lib/components/Canvas.svelte';

  let pixelSizeConstant: number = 5;
  let pixelSize: number = 5;
  let zoom: number = 1;

  function onWheel(event: WheelEvent) {
    //console.log("Wheel event delta:", event.deltaY);

    // do stuff with zoom here
    zoom = zoom + (.001 * -event.deltaY);
    pixelSize = pixelSizeConstant * zoom

    console.log("New zoom constant:", zoom);
  }
</script>

<div on:wheel={onWheel}>
    <Canvas pixelSize={pixelSize}></Canvas>
</div>