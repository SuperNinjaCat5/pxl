<svelte:head>
  <title>Pixel - Shop</title>
</svelte:head>

<script>
  import ShopItem from '$lib/components/ShopItem.svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { signOut } from '@auth/sveltekit/client';
  import '$lib/assets/styles/shop.css'
  import AdminButton from '$lib/components/AdminButton.svelte';

  const allowed_emails = ["ben.elliott.2021@gmail.com","web@niiccoo2.xyz"];
  let email = null;

  onMount(() => {
    email = $page.data.session?.user?.email ?? null;

    if (!email) {
      goto('/');
    }
    else {
      if (!allowed_emails.includes(email)) {
        goto('/account')
      }
    }
  });

const products = [
  {
    name: 'Retro Pixel Hat',
    price: '$15',
    note: 'Limited Edition',
    image: 'https://www.shutterstock.com/image-vector/pixelated-cowpoke-hat-red-bandana-260nw-2671680181.jpg'
  },
  {
    name: 'Pixel logo',
    price: '$25',
    note: 'W Art',
    image: '/images/pxl-logo.svg'
  },
  {
    name: '8-bit Shield',
    price: '$20',
    note: 'Defender of Pixels',
    image: 'https://via.placeholder.com/150/00fff9/000000?text=Shield'
  },
  {
    name: 'Pixel T-shirt',
    price: '$67',
    note: 'is that a 67',
    image: 'https://via.placeholder.com/150/2802ff/ffffff?text=TShirt'
  },
  {
    name: 'Pixel Sticker Pack',
    price: '$5',
    note: 'Collect them all!',
    image: 'https://via.placeholder.com/150/1cce75/ffffff?text=Stickers'
  },
  {
    name: 'Pixel Backpack',
    price: '$35',
    note: 'Carry your pixels',
    image: 'https://via.placeholder.com/150/356877/ffffff?text=Backpack'
  },
  {
    name: 'Pixel Mug',
    price: '$12',
    note: 'Perfect for coffee',
    image: 'https://via.placeholder.com/150/115352/ffffff?text=Mug'
  }];
</script>

<div class="navbar">
  <div class="nav-left">
    <a href="/home"><button>Home</button></a>
    <a href="/bitvualt">
      <button class="bitvualt-button">
        <span class="glitch-layer">Enter the Bitvault</span>
        <span class="glitch-layer">Enter the Bitvault</span>
        <span class="glitch-layer">Enter the Bitvault</span>
        <span class="glitch-layer">Enter the Bitvault</span>
        Enter the Bitvault
      </button>
    </a>
    <AdminButton location='/admin/shop' title='Shop Edit'></AdminButton>
  </div>

  <div class="nav-right">
    {#if $page.data.session}
      <span class="account-navbar">Signed in as {$page.data.session.user?.email}</span>
    {:else}
      <span class="account-navbar">Not signed in</span>
    {/if}
    <button on:click={() => signOut()}>Sign out</button>
  </div>
</div>


<div class="shop-wrapper">
  {#each products as product}
    <ShopItem 
      name={product.name} 
      price={product.price} 
      note={product.note} 
      image={product.image} 
    />
  {/each}
</div>