<svelte:head>
  <title>Pixel - Bitvualt</title>
</svelte:head>

<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Canvas from '$lib/components/Canvas.svelte'
  export let data: { admin_viewer: boolean };
  const user_is_admin = data.admin_viewer; // only for displaying buttons and stuff
</script>

<Header home_button={true} bitvualt_button={true} canvas_mod={user_is_admin}></Header>

<Canvas></Canvas>