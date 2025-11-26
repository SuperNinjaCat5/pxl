<script>
  import Header from '$lib/components/Header.svelte';
  import Canvas from '$lib/components/Canvas.svelte';
</script>

<svelte:head>
  <title>Pixel - Home</title>
</svelte:head>

<Header welcome_message={true}></Header>

<div class="page-content">
  <br />

  <a href="/canvas"
    ><button class="canvas-button">
      <span class="glitch-layer">Enter the Bitvault</span>
      <span class="glitch-layer">Enter the Bitvault</span>
      <span class="glitch-layer">Enter the Bitvault</span>
      <span class="glitch-layer">Enter the Bitvault</span>
      Enter the Bitvault
    </button></a>

  <a href="/shop"><button>Shop</button></a>

  <Canvas editable={false}></Canvas>
</div>
