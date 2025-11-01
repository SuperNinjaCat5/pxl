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

  <a href="/bitvualt"><button>Edit the canvas?</button></a>

  <button on:click={() => signOut()}>Sign out</button>
</div>