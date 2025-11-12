<svelte:head>
  <title>Pixel</title>
</svelte:head>
<script>
  import { signIn, signOut } from "@auth/sveltekit/client"
  import pxlTitle from '$lib/assets/pxl-title.png';
  import '$lib/assets/styles/home.css'

</script>

<div class="home-wrapper">
  <img src={pxlTitle} alt="PXL logo" class="pxl-logo" />
  <button on:click={() => signIn("github")}>Sign in with GitHub</button>
</div>
