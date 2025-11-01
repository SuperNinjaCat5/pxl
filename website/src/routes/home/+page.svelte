<svelte:head>
  <title>pxl</title>
</svelte:head>

<script lang="ts">
  import { signIn, signOut } from "@auth/sveltekit/client"
  import { page } from "$app/stores"
  import { goto } from '$app/navigation'
  import { onMount } from "svelte";

  onMount(() => {
    if ($page.data.session) {
      return;
    }
    else {
      goto('/')
    }
  })
</script>

<div>
  <h1>Welcome to pxl</h1>
  {#if $page.data.session}<h5>Signed in as {$page.data.session.user?.email}</h5>{:else}<h5>Not signed in</h5>{/if}
  <a href="/bitvualt"><button>Edit the canvas?</button></a>
  
  <button on:click={() => signOut()}>Sign out</button>
</div>