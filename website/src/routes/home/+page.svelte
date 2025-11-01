<svelte:head>
  <title>pxl</title>
</svelte:head>

<script lang="ts">
  import { signIn, signOut } from "@auth/sveltekit/client";
  import { page } from "$app/stores";
  import { goto } from '$app/navigation';
  import { onMount } from "svelte";

  const allowed_emails = ["ben.elliott.2021@gmail.com", "web@niiccoo2.xyz"];
  let email: string | null = null

  onMount(() => {
    email = $page.data.session?.user?.email ?? null; 

    if (!email || !allowed_emails.includes(email)) {
      goto('/');
    }
  });
</script>

{#if email && allowed_emails.includes(email)}
<div>
  <h1>Welcome to pxl</h1>
  {#if $page.data.session}<h5>Signed in as {$page.data.session.user?.email}</h5>{:else}<h5>Not signed in</h5>{/if}
  <a href="/bitvualt"><button>Edit the canvas</button></a>
  
  <button on:click={() => signOut()}>Sign out</button>
</div>
{:else}
<p>Loser</p>
{/if}