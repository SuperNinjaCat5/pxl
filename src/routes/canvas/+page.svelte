<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import CanvasHolder from '$lib/components/CanvasHolder.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	const SEC_PER_PIXEL: number = 300; // 5 min
	// should prob have an api that this reads from

	const DEBUG: boolean = true;

	let currentColor: string = '#FF0000';
	let numberOfPlaceablePixels: number = 0;

	console.log('totalPixelsPlaced', data.totalPixelsPlaced);

	$: totalPixelsPlaced = data.totalPixelsPlaced || 0;
	$: totalTime = data.totalTime || 0;
	$: readableTime = data.readableTime || '';

	$: {
		const calculatedPixels = Math.floor(totalTime / SEC_PER_PIXEL - totalPixelsPlaced);
		numberOfPlaceablePixels = Math.max(0, calculatedPixels);
	}

	if (DEBUG) {
		console.log('totalTime', totalTime);
		// console.log('totalPixelsPlaced', totalPixelsPlaced);
	}

	const palette = [
		'#FF0000', // Red
		'#FFA500', // Orange
		'#FFFF00', // Yellow
		'#00FF00', // Green
		'#0000FF', // Blue
		'#800080', // Purple
		'#000000', // Black
		'#FFFFFF' // White
	];
</script>

<svelte:head>
	<title>Pixel - Canvas</title>
</svelte:head>

<Header home_button={true} shop_button={true} is_canvas={true}></Header>

<div class="canvas-layout">
	<div class="canvas-holder-area">
		<CanvasHolder {currentColor} on:pixelPlaced={() => (totalPixelsPlaced += 1)} />
	</div>
	<div class="side-panel">
		<!-- Color palette grid -->
		<div class="color-palette">
			{#each palette as color}
				<button
					class="color-swatch {currentColor === color ? 'selected' : ''}"
					style="background:{color};"
					on:click={() => (currentColor = color)}
					aria-label={color}>
				</button>
			{/each}
		</div>
		<div class="hackatime-info">
			<p>{numberOfPlaceablePixels} pixels</p>
		</div>
	</div>
</div>

<style>
	.color-palette {
		display: grid;
		grid-template-columns: repeat(4, 2rem);
		grid-template-rows: repeat(2, 2rem);
		gap: 0.5rem;
		margin-top: 2rem;
	}

	.color-swatch {
		width: 2rem;
		height: 2rem;
		border: 3px solid #0077ff;
		box-shadow: 4px 4px 0 #004c99;
		cursor: pointer;
		padding: 0;
		box-sizing: border-box;
		font-size: 1.2rem;
		transition:
			border-color 0.15s,
			box-shadow 0.15s;
	}

	.color-swatch.selected {
		border-color: black;
		box-shadow: 4px 4px 0 #888;
	}

	.hackatime-info {
		padding-top: 5vh;
	}
</style>
