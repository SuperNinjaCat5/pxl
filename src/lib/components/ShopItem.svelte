<script>
    import '$lib/assets/styles/shop.css'
    export let name = '';
    export let price = '';
    export let note = '';
    export let image = '';
</script>

<div class="item">
    {#if image}
    <img src={image} alt={name} class="item-image">
    {/if}
    <div class="item-name">{name}</div>
    <div class="item-price">{price}</div>
    {#if note}
    <div class="item-note">{note}</div>
    {/if}
</div>


