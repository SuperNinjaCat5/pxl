<script lang="ts">
  import favicon from '$lib/assets/favicon.svg';
  import '$lib/assets/styles/main.css';

  // Imports:
  import pxlTitle from '$lib/assets/pxl-title.png';

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
