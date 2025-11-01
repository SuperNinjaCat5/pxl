<svelte:head>
  <title>pxl</title>
</svelte:head>

<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { signOut } from '@auth/sveltekit/client';

  const allowed_emails = ["web@niiccoo2.xyz"];
  let email = null;

  onMount(() => {
    email = $page.data.session?.user?.email ?? null;

    if (!email || !allowed_emails.includes(email)) {
      goto('/account');
    }
  });
</script>

<div>
  <h1>Welcome to pxl</h1>
  {#if $page.data.session}<h5>Signed in as {$page.data.session.user?.email}</h5>{:else}<h5>Not signed in</h5>{/if}
  <a href="/bitvualt"><button>Edit the canvas</button></a>
  
  <button on:click={() => signOut()}>Sign out</button>
</div>