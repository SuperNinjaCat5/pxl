<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/assets/styles/main.css'
	import AdminButton from '$lib/components/AdminButton.svelte';
	
	// Imports:
	import pxlTitle from '$lib/assets/pxl-title.png';


	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
