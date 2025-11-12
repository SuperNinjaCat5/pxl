<svelte:head>
  <title>Pixel - Home</title>
</svelte:head>

<script>
  import { page } from '$app/stores';
  import { signOut } from '@auth/sveltekit/client';
</script>
<div class="navbar">
  <div class="nav-left">
    <h1>Welcome to pxl</h1>
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
  <br>
  
  <a href="/bitvualt"><button class="bitvualt-button">
  <span class="glitch-layer">Enter the Bitvault</span>
  <span class="glitch-layer">Enter the Bitvault</span>
  <span class="glitch-layer">Enter the Bitvault</span>
  <span class="glitch-layer">Enter the Bitvault</span>
  Enter the Bitvault
  </button></a>
  
  <a href="/shop"><button>Shop</button></a>
</div>