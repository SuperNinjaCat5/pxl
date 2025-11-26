<script lang=ts>
  import { page } from '$app/stores';
  import { signOut } from '@auth/sveltekit/client';
  import AdminButton from '$lib/components/AdminButton.svelte';
  export let message = '';
  export let welcome_message = false;
  export let home_button = false;
  export let shop_button = false;
  export let canvas_button = false;
  export let shop_admin_button = false;
  export let ship_admin_button = false;
  export let admin_button = false;
  export let canvas_mod = false;
  export let is_canvas = false;
</script>

<div class="navbar" style={is_canvas ? 'height: 10vh' : undefined}>  
  <div class="nav-left">
    {#if message}<h1>{message}</h1>{/if} <!--Custom Message-->
    {#if welcome_message}<h1>Welcome to Pxl</h1>{/if}
    {#if home_button}<a href="/home"><button>Home</button></a>{/if}
    {#if shop_button}<a href="/shop"><button>Shop</button></a>{/if}
    {#if canvas_button}<a href="/canvas"><button class="canvas-button"><span class="glitch-layer">Enter the Bitvault</span><span class="glitch-layer">Enter the Bitvault</span><span class="glitch-layer">Enter the Bitvault</span><span class="glitch-layer">Enter the Bitvault</span>Enter the Bitvault</button></a>{/if}
    {#if shop_admin_button}<AdminButton location='/admin/shop' title='Shop Edit'></AdminButton>{/if}
    {#if ship_admin_button}<AdminButton location='/admin/shop' title='Shop Edit'></AdminButton>{/if}
    {#if canvas_mod}<AdminButton location='/admin/canvas' title='Canvas Mod'></AdminButton>{/if}
    {#if admin_button == true}<AdminButton location='/admin' title='Admin'></AdminButton>{/if}
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