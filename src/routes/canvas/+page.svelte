<svelte:head>
  <title>Pixel - Canvas</title>
</svelte:head>

<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Canvas from '$lib/components/Canvas.svelte';
</script>

<Header home_button={true} shop_button={true} is_canvas={true}></Header>

<Canvas></Canvas>