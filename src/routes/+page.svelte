<script lang="ts">
	import { signIn, signOut } from '@auth/sveltekit/client';
	import pxlTitle from '$lib/assets/pxl-title.png';
	import '$lib/assets/styles/home.css';
	import { goto } from '$app/navigation';

	export let data: { logged_in: boolean };
	const logged_in = data.logged_in; // only for displaying buttons and stuff
</script>

<svelte:head>
	<title>Pixel</title>
</svelte:head>

<div class="home-wrapper">
	<img src={pxlTitle} alt="PXL logo" class="pxl-logo" />
	<!-- <button on:click={() => signIn("github")}>Sign in with GitHub</button> -->
	{#if logged_in}<button on:click={() => goto('/home')}>Go to Homepage</button>{:else}
		<button on:click={() => signIn('hackclub', { callbackUrl: '/home' })}
			>Sign in with Hackclub</button
		>{/if}
</div>
