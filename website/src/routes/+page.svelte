<svelte:head>
  <title>pxl</title>
</svelte:head>
<script>import pxlTitle from '$lib/assets/pxl-title.png';

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
  <div class="hometext-center">
    <p class="welcome">
      Welcome to
      <img src={pxlTitle} alt="PXL logo" class="pxl-logo" />
    </p>
    <br><br>
    <a href=/login><button>Sign In?</button></a>

    <a href=/home><p style="font-size: 5px; margin: 15px;">rlly secret bypass</p></a>
  </div>
</div>
