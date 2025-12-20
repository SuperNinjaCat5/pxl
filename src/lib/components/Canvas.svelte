<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';

	const dispatch = createEventDispatcher();

	export let editable = true;

	type Pixel = {
		x: number;
		y: number;
		color: string;
	};

	type Header = {
		width: number;
		height: number;
		generated_at: number;
	};

	type PixelResponse = [Header, Pixel[]];

	// let pixels = [{ x: 1, y: 1, color: 'red' },{ x: 3, y: 1, color: 'blue' },{ x: 100, y: 1, color: 'red' },{ x: 8, y: 6, color: 'blue' }];

	let header: Header | null = null;
	let pixels: Pixel[] = [];

	let error: string = '';

	export let currentColor: string = '#FF0000';

	let sse: EventSource | null = null;

	let offsetX: number = 0;
	let offsetY: number = 0;

	let mounted: boolean = false;
	let isPanning: boolean = false;

	let startX: number, startY: number;

	// canvas setup
	let canvas: HTMLCanvasElement;
	const width = 512; // total grid width
	const height = 512; // total grid height

	export let pixelSize: number = 5;

	// guard value used for sizing/drawing so we never use NaN/Infinity/<=0
	$: safePixelSize = Number.isFinite(pixelSize) && pixelSize > 0 ? pixelSize : 5;

	function drawPixel(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
		const psz = safePixelSize;
		const px = Math.round(x * psz);
		const py = Math.round(y * psz);
		ctx.fillStyle = color;
		ctx.fillRect(px, py, Math.max(1, psz), Math.max(1, psz));
	}

	// redraw scheduling (batch multiple updates into one rAF)
	let redrawScheduled = false;
	function scheduleRedraw() {
		if (redrawScheduled) return;
		redrawScheduled = true;
		requestAnimationFrame(() => {
			redrawScheduled = false;
			redrawAll();
		});
	}

	function redrawAll() {
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// ensure internal buffer matches current pixel size
		canvas.width = Math.max(1, width * safePixelSize);
		canvas.height = Math.max(1, height * safePixelSize);

		// clear/background using internal resolution
		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// compute visible grid bounds from canvas dimensions and pixel size
		const viewLeft = 0;
		const viewTop = 0;
		const viewRight = Math.ceil(canvas.width / safePixelSize);
		const viewBottom = Math.ceil(canvas.height / safePixelSize);

		// clamp to world bounds
		const minX = Math.max(0, viewLeft);
		const minY = Math.max(0, viewTop);
		const maxX = Math.min(width - 1, viewRight);
		const maxY = Math.min(height - 1, viewBottom);

		// draw only pixels inside the visible rect
		for (const { x, y, color } of pixels) {
			if (x < minX || x > maxX || y < minY || y > maxY) continue;
			drawPixel(ctx, x, y, color);
		}
	}

	onMount(async () => {
		try {
			const res = await fetch(`/api/pixels/get`);
			if (!res.ok) throw new Error(`API error: ${res.status}`);
			const json = (await res.json()) as PixelResponse;

			header = json[0];
			pixels = json[1];

			console.log('header:', header);
			console.log('pixels:', pixels);
		} catch (err) {
			error = String(err);
			console.error('Fetch failed:', err);
		}

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		mounted = true;

		canvas.width = width * safePixelSize;
		canvas.height = height * safePixelSize;

		// background
		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, width * safePixelSize, height * safePixelSize);

		// draw initial pixels via centralized redraw
		redrawAll();

		sse = new EventSource('/api/pixels/stream');
		sse.onmessage = (e) => {
			try {
				console.log('New stream data:', e.data);
				const msg = JSON.parse(e.data);
				const x = msg.x;
				const y = msg.y;
				const color = msg.color;
				// Update local pixels state so redraws (eg. on zoom) include this pixel
				const found = pixels.findIndex((p) => p.x === x && p.y === y);
				if (found >= 0) {
					pixels[found] = { x, y, color };
					pixels = pixels; // trigger Svelte reactivity
				} else {
					pixels = [...pixels, { x, y, color }];
				}
				// schedule a batched redraw (will coalesce multiple updates)
				scheduleRedraw();
			} catch (err) {
				console.error('SSE parse/draw error', err);
			}
		};

		// don't aggressively close on generic errors during load; let browser retry
		sse.onerror = (e) => {
			console.warn('Stream error (non-fatal):', e, 'readyState=', sse?.readyState);
		};
	});

	onDestroy(() => {
		try {
			sse?.close();
		} catch {}
		sse = null;
	});

	// react to pixelSize, pixels, or offsets changing and schedule redraw
	$: if (mounted && canvas) {
		// reference these so Svelte tracks changes
		void safePixelSize;
		void pixels;
		void offsetX;
		void offsetY;
		scheduleRedraw();
	}

	function canvasToPixel(e: MouseEvent | PointerEvent) {
		const rect = canvas.getBoundingClientRect();

		// scale from CSS size → internal canvas size
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;

		let x = Math.floor((e.clientX - rect.left) * scaleX);
		let y = Math.floor((e.clientY - rect.top) * scaleY);

		x = Math.round(x / safePixelSize);
		y = Math.round(y / safePixelSize);

		console.log(`Found x and y: (${x}, ${y})`);

		if (editable == false) {
			console.log(`In read-only canvas mode, so not sending request to place pixel`);
		}

		return { x, y };
	}

	function onMouseDown(event: MouseEvent | PointerEvent) {
		console.log('Ran onMouseDown');
		if (event.button === 2) {
			// 0 is left, 1 is center, 2 is right
			isPanning = true;
			startX = event.clientX;
			startY = event.clientY;
			event.preventDefault();
		} else if (event.button === 0) {
			placePixel(event);
		}
	}

	function onMouseMove(event: MouseEvent | PointerEvent) {
		// console.log('Ran onMouseMove')
		if (isPanning) {
			// console.log('Is onMouseMove AND isPanning')
			const dx = event.clientX - startX;
			const dy = event.clientY - startY;

			offsetX += dx;
			offsetY += dy;

			startX = event.clientX;
			startY = event.clientY;

			console.log(`offsetX: ${offsetX}, offsetY: ${offsetY}`);
			scheduleRedraw();
		}
	}

	function onMouseUp(event: MouseEvent | PointerEvent) {
		isPanning = false;
	}

	async function placePixel(e: MouseEvent | PointerEvent) {
		const { x, y } = canvasToPixel(e);

		if (x < 0 || y < 0 || x >= width || y >= height) return;

		if (editable == false) {
			return;
		} // Stop user from placing if the canvas is not editable

		// send request to api to place pixel

		try {
			const res = await fetch(`/api/pixels/place`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					x,
					y,
					color: currentColor,
					placed_by: $page.data?.session?.user?.email ?? 'null'
				})
			});

			if (!res.ok) {
				console.error('Unable to place pixel:', await res.text());
			} else {
				console.log(`placed pixel at (${x}, ${y})`);
				dispatch('pixelPlaced');

				// Optimistically update local pixels so subsequent redraws include it
				const existing = pixels.findIndex((p) => p.x === x && p.y === y);
				if (existing >= 0) {
					pixels[existing] = { x, y, color: currentColor };
					pixels = pixels;
				} else {
					pixels = [...pixels, { x, y, color: currentColor }];
				}
			}
		} catch (err) {
			console.error('network error:', err);
		}
	}
</script>

{#if error}
	<p>Error: {error}</p>
{:else}
	<div>
		<canvas
			bind:this={canvas}
			on:mousedown={onMouseDown}
			on:mousemove={onMouseMove}
			on:mouseup={onMouseUp}
			style="image-rendering: pixelated;
          	width: {width * safePixelSize}px;
          	height: {height * safePixelSize}px;
			transform: translate({offsetX}px, {offsetY}px);"
			class="canvas">
		</canvas>

		<!-- on:click={placePixel} -->

		<!-- <input bind:value={pixelSize}> -->
	</div>
{/if}
