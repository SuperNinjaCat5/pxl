<script lang="ts">
  import { signIn, signOut } from "@auth/sveltekit/client"
  import { page } from "$app/stores"
</script>

<svelte:head>
    <title>pxl - Login</title>
</svelte:head>

{#if $page.data.session}
  <button on:click={() => signOut()}>Sign out</button>
{:else}
  <button on:click={() => signIn("github")}>Sign in with GitHub</button>
{/if}
