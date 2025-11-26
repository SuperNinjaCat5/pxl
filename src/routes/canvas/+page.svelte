<svelte:head>
  <title>Pixel - Canvas</title>
</svelte:head>

<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import CanvasHolder from '$lib/components/CanvasHolder.svelte';
</script>

<Header home_button={true} shop_button={true} is_canvas={true}></Header>

<div class="page-content">
  <CanvasHolder></CanvasHolder>
</div>