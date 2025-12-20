<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import CanvasHolder from '$lib/components/CanvasHolder.svelte';
	import AdminButton from '$lib/components/AdminButton.svelte';
	import { redirect } from '@sveltejs/kit';
	import { goto } from '$app/navigation';
	export let data: { admin_viewer: boolean };
	const user_is_admin = data.admin_viewer; // only for displaying buttons and stuff
</script>

<svelte:head>
	<title>Pixel - Home</title>
</svelte:head>

<Header welcome_message={true}></Header>

<div class="page-content">
	<div class="home-actions">
		<br />

		<a href="/canvas"
			><button class="canvas-button">
				<span class="glitch-layer">Enter the Bitvault</span>
				<span class="glitch-layer">Enter the Bitvault</span>
				<span class="glitch-layer">Enter the Bitvault</span>
				<span class="glitch-layer">Enter the Bitvault</span>
				Enter the Bitvault
			</button></a>

		<button on:click={() => goto('/shop')}>Shop</button>
		{#if user_is_admin == true}<AdminButton location="/admin" title="Admin"></AdminButton>{/if}
	</div>
	<CanvasHolder editable={false} on_homepage={true}></CanvasHolder>
</div>
