<svelte:head>
  <title>pxl</title>
</svelte:head>
<script>
  import { signIn, signOut } from "@auth/sveltekit/client"
  import pxlTitle from '$lib/assets/pxl-title.png';
  import '$lib/assets/styles/home.css'

  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte';

  onMount(() => {
    if ($page.data.session) {
      goto('/home');
    }
  })
</script>


<div class="home-wrapper">
  <img src={pxlTitle} alt="PXL logo" class="pxl-logo" />
  <button on:click={() => signIn("github")}>Sign in with GitHub</button>
</div>
