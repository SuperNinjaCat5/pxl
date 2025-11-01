<script lang="ts">
  import { signIn, signOut } from "@auth/sveltekit/client"
  import { page } from "$app/stores"
  import { goto } from '$app/navigation'
  import { onMount } from "svelte";
</script>

<svelte:head>
    <title>pxl</title>
</svelte:head>

{#if $page.data.session}
  <p>Signed in as {$page.data.session.user?.email}</p>
{:else}
  <p>Not signed in</p>
{/if}

{#if $page.data.session}
  <button on:click={() => signOut()}>Sign out</button>
{:else}
  <button on:click={() => signIn("github")}>Sign in with GitHub</button>
{/if}


