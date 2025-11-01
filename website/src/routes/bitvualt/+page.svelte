<head>
  <title>Pxl</title>
</head>


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

   
    let selectedColor = '#ff0000';
    let pendingLink = '';
    let showPicker = false;
    let pickerStyle = { left: '0px', top: '0px' };
    let pendingX: number | null = null;
    let pendingY: number | null = null;

  let hoverX: number | null = null;
  let hoverY: number | null = null;
  let allowOverride = false;

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

   function render(pixelsMap: Map<string, {color: string, link?: string, user: string}>, hx: number | null, hy: number | null) {
     ctx.clearRect(0, 0, 1000, 1000);
     for (let [key, data] of pixelsMap) {
       const [x, y] = key.split(',').map(Number);
       ctx.fillStyle = data.color;
       ctx.fillRect(x * unitSize, y * unitSize, unitSize, unitSize);
     }

     // draw hover highlight on top
     if (hx !== null && hy !== null) {
       const key = `${hx},${hy}`;
       const occupied = pixelsMap.has(key);
       // choose overlay color depending on occupied and override
       let fillColor = 'rgba(0,0,255,0.18)';
       let strokeColor = 'rgba(0,0,200,0.9)';
       if (occupied) {
         if (allowOverride) {
           fillColor = 'rgba(255,165,0,0.22)'; // orange for replace
           strokeColor = 'rgba(255,140,0,0.95)';
         } else {
           fillColor = 'rgba(255,0,0,0.22)'; // red for blocked
           strokeColor = 'rgba(200,0,0,0.95)';
         }
       }
       ctx.save();
       ctx.fillStyle = fillColor;
       ctx.fillRect(hx * unitSize, hy * unitSize, unitSize, unitSize);
       ctx.lineWidth = 2;
       ctx.strokeStyle = strokeColor;
       ctx.strokeRect(hx * unitSize + 1, hy * unitSize + 1, unitSize - 2, unitSize - 2);
       ctx.restore();
     }
   }

   $: if (ctx) render($pixels, hoverX, hoverY);

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
       const occupied = $pixels.has(key);
       if (occupied) {
         if (!allowOverride) {
           const link = $pixels.get(key)!.link;
           if (link) {
             window.open(link, '_blank');
           }
           // hide picker if open
           showPicker = false;
           return;
         }
         // if override allowed, fallthrough to placing (show picker)
       }

       // placing or overriding
       if (coins >= pixelCost) {
         pendingX = x;
         pendingY = y;
         const left = Math.min(window.innerWidth - 220, Math.max(0, event.clientX));
         const top = Math.min(window.innerHeight - 140, Math.max(0, event.clientY));
         pickerStyle = { left: `${left}px`, top: `${top}px` };
         pendingLink = '';
         showPicker = true;
       } else {
         alert(`Not enough coins! You need ${pixelCost} coin(s) to place a pixel.`);
       }
     }

    function handleMouseMove(event: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) / unitSize);
      const y = Math.floor((event.clientY - rect.top) / unitSize);
      if (x !== hoverX || y !== hoverY) {
        hoverX = x;
        hoverY = y;
      }
    }

    function handleMouseLeave() {
      hoverX = null;
      hoverY = null;
    }

    async function confirmPlace() {
      if (pendingX === null || pendingY === null) return;
      const x = pendingX;
      const y = pendingY;
      const color = selectedColor;
      const link = pendingLink || undefined;
      const response = await fetch('/api/pixels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x, y, color, link, username })
      });
      const data = await response.json();
      if (data.success) {
        const key = `${x},${y}`;
        pixels.update(p => {
          p.set(key, { color, link, user: username });
          return p;
        });
        coins -= pixelCost;
        await fetchBalance();
        showPicker = false;
        pendingX = pendingY = null;
      } else {
        alert(data.error || 'Failed to place pixel');
      }
    }

    function cancelPlace() {
      showPicker = false;
      pendingX = pendingY = null;
    }
</script>

 <div>
   <p>Username: {username}</p>
   <p>Coins: {coins}</p>
   <canvas bind:this={canvas} width="1000" height="1000" on:click={handleClick} on:mousemove={handleMouseMove} on:mouseleave={handleMouseLeave} style="border: 1px solid black; cursor: pointer;"></canvas>
  <label style="display:block; margin-top:8px;">
    <input type="checkbox" bind:checked={allowOverride} /> Allow override (replace existing pixels)
  </label>
   {#if showPicker}
     <div class="picker" style="left: {pickerStyle.left}; top: {pickerStyle.top};">
       <label>Color: <input type="color" bind:value={selectedColor} /></label>
       <label>Link: <input type="url" placeholder="https://example.com" bind:value={pendingLink} /></label>
       <div class="picker-buttons">
         <button on:click={confirmPlace}>Confirm</button>
         <button on:click={cancelPlace}>Cancel</button>
       </div>

      
     </div>
   {/if}
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

    <style>
      .picker {
        position: fixed;
        z-index: 1000;
        background: white;
        border: 1px solid #ccc;
        padding: 8px;
        width: 200px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .picker label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        font-size: 14px;
      }
      .picker input[type="url"] {
        width: 110px;
      }
      .picker-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
    </style>
