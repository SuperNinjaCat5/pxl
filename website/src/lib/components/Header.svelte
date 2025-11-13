<script lang=ts>
  import { page } from '$app/stores';
  import { signOut } from '@auth/sveltekit/client';
</script>

<div class="navbar">
  <div class="nav-left">
    <a href="/home"><button>Home</button></a>
    <a href="/shop"><button>Shop</button></a>
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