  <script lang="ts">
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let pixels = writable(new Map<string, {color: string, link?: string, user: string}>());
    let coins: number = 0;
    let username: string = '';
    let testUsername: string = '';
    let testAmount: number = 0;
    const unitSize = 10;
    const pixelCost = 1;

    async function fetchBalance() {
      const response = await fetch(`/api/balance/${username}`);
      const data = await response.json();
      coins = data.balance;
    }

    async function fetchPixels() {
      const response = await fetch('/api/pixels');
      const data = await response.json();
      pixels.set(new Map(data.pixels));
    }

    onMount(async () => {
      ctx = canvas.getContext('2d')!;
      const savedUsername = localStorage.getItem('username');
      if (savedUsername) {
        username = savedUsername;
      } else {
        username = prompt('Enter your username:') || 'Anonymous';
        localStorage.setItem('username', username);
      }
      await fetchPixels();
      await fetchBalance();
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

    async function increaseBalance() {
      const response = await fetch('/api/balance/increase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: testUsername, amount: testAmount })
      });
      const data = await response.json();
      if (data.success) {
        alert('Balance increased successfully');
        if (testUsername === username) {
          await fetchBalance();
        }
      } else {
        alert('Failed to increase balance');
      }
    }

     async function handleClick(event: MouseEvent) {
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
               const response = await fetch('/api/pixels', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ x, y, color, link, username })
               });
              const data = await response.json();
              if (data.success) {
                pixels.update(p => {
                  p.set(key, { color, link: link || undefined, user: username });
                  return p;
                });
                coins -= pixelCost;
                await fetchBalance(); // refresh balance
              } else {
                alert(data.error || 'Failed to place pixel');
              }
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
     <h2>Increase Balance (for testing)</h2>
     <form on:submit|preventDefault={increaseBalance}>
       <label>
         Username: <input type="text" bind:value={testUsername} required />
       </label>
       <label>
         Amount: <input type="number" bind:value={testAmount} required />
       </label>
       <button type="submit">Increase Balance</button>
     </form>
 </div>
