<script>
	import { page } from '$app/state';
	import '$lib/assets/styles/admin.css';
	import '$lib/assets/styles/admin-page.css';
	export let location = '';
	export let title = '';
</script>

{#if location}
	<a href={location}><button class="admin-button">{title}</button></a>
{/if}
