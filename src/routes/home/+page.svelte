<svelte:head>
  <title>Pixel - Home</title>
</svelte:head>

<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Canvas from '$lib/components/Canvas.svelte';
  import AdminButton from '$lib/components/AdminButton.svelte';
  export let data: { admin_viewer: boolean };
  const user_is_admin = data.admin_viewer; // only for displaying buttons and stuff
</script>

<Header welcome_message={true}></Header>

<div class="page-content">
  <br>
  
  <a href="/canvas"><button class="canvas-button">
  <span class="glitch-layer">Enter the Bitvault</span>
  <span class="glitch-layer">Enter the Bitvault</span>
  <span class="glitch-layer">Enter the Bitvault</span>
  <span class="glitch-layer">Enter the Bitvault</span>
  Enter the Bitvault
  </button></a>
  
  <a href="/shop"><button>Shop</button></a>
  {#if user_is_admin == true}<AdminButton location='/admin' title='Admin'></AdminButton>{/if}
  <Canvas editable={false}></Canvas>
</div>