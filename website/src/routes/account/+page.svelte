<script lang="ts">
  import { signIn, signOut } from "@auth/sveltekit/client"
  import { page } from "$app/stores"
  import { goto } from '$app/navigation'
  import { onMount } from "svelte";
  import { invalidate } from '$app/navigation';

  async function handleSignOut() {
    await signOut();     
    await invalidate('.');    
    goto('/');      
  }
</script>

<svelte:head>
    <title>Pixel - Account</title>
</svelte:head>

<h1 style="color: black;">Sorry no leeks</h1>

{#if $page.data.session}
  <p>Signed in as {$page.data.session.user?.email}</p>
{:else}
  <p>Not signed in</p>
{/if}

{#if $page.data.session}
<button on:click={handleSignOut}>Sign out</button>
{:else}
<button on:click={() => signIn("github")}>Sign in with GitHub</button>
<button on:click={() => signIn("slack")}>Sign in with Slack</button>
{/if}
