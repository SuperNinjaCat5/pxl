<script>
    import { page } from '$app/state';
    import '$lib/assets/styles/admin.css'
    export let location = '';
    export let title = '';
</script>

{#if location}
<a href={location}><button class="admin-button">{title}</button></a>
{/if}
