 <script lang="ts">
   import { onMount } from 'svelte';
   import { writable } from 'svelte/store';

   let canvas: HTMLCanvasElement;
   let ctx: CanvasRenderingContext2D;
   let pixels = writable(new Map<string, {color: string, link?: string, user: string}>());
   let coins: number;
   let username: string = '';
   const unitSize = 10;
   const pixelCost = 1;

   onMount(() => {
     ctx = canvas.getContext('2d')!;
     const savedUsername = localStorage.getItem('username');
     if (savedUsername) {
       username = savedUsername;
     } else {
       username = prompt('Enter your username:') || 'Anonymous';
       localStorage.setItem('username', username);
     }
     const savedPixels = localStorage.getItem('pixels');
     if (savedPixels) {
       pixels.set(new Map(JSON.parse(savedPixels)));
     }
     const savedCoins = localStorage.getItem('coins');
     coins = savedCoins ? parseInt(savedCoins) : 100;
   });

   function render(pixelsMap: Map<string, {color: string, link?: string, user: string}>) {
     ctx.clearRect(0, 0, 1000, 1000);
     for (let [key, data] of pixelsMap) {
       const [x, y] = key.split(',').map(Number);
       ctx.fillStyle = data.color;
       ctx.fillRect(x * unitSize, y * unitSize, unitSize, unitSize);
     }
   }

   $: if (ctx) render($pixels);

  function saveCoins() {
    localStorage.setItem('coins', coins.toString());
  }

   function getLeaderboard(pixelsMap: Map<string, {color: string, link?: string, user: string}>) {
     const userCounts: { [user: string]: number } = {};
     for (let data of pixelsMap.values()) {
       userCounts[data.user] = (userCounts[data.user] || 0) + 1;
     }
     return Object.entries(userCounts)
       .sort((a, b) => b[1] - a[1])
       .slice(0, 10);
   }

   $: leaderboard = getLeaderboard($pixels);

   function handleClick(event: MouseEvent) {
     const rect = canvas.getBoundingClientRect();
     const x = Math.floor((event.clientX - rect.left) / unitSize);
     const y = Math.floor((event.clientY - rect.top) / unitSize);
     const key = `${x},${y}`;
     if ($pixels.has(key)) {
       const link = $pixels.get(key)!.link;
       if (link) {
         window.open(link, '_blank');
       }
     } else {
       if (coins >= pixelCost) {
         const color = prompt('Enter color (hex or name):');
          if (color) {
            const link = prompt('Enter link (optional):');
            pixels.update(p => {
              p.set(key, { color, link: link || undefined, user: username });
              return p;
            });
            localStorage.setItem('pixels', JSON.stringify(Array.from($pixels)));
            coins -= pixelCost;
            saveCoins();
          }
       } else {
         alert(`Not enough coins! You need ${pixelCost} coin(s) to place a pixel.`);
       }
     }
   }
</script>

<div>
  <p>Username: {username}</p>
  <p>Coins: {coins}</p>
  <canvas bind:this={canvas} width="1000" height="1000" on:click={handleClick} style="border: 1px solid black; cursor: pointer;"></canvas>
   <h2>Leaderboard</h2>
   <ol>
     {#each leaderboard as [user, count]}
       <li>{user}: {count} pixels</li>
     {/each}
   </ol>
</div>
