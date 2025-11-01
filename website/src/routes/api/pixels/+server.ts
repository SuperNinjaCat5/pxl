import { pixels } from '$lib/pixels';
import { balances } from '$lib/balances';
import { json } from '@sveltejs/kit';

export async function GET() {
  return json({ pixels: Array.from(pixels) });
}

export async function POST({ request }) {
  const { x, y, color, link, username } = await request.json();
  const key = `${x},${y}`;
  const pixelCost = 1;
  const currentBalance = balances.get(username) || 0;
  if (currentBalance < pixelCost) {
    return json({ success: false, error: 'Not enough coins' }, { status: 400 });
  }
  if (pixels.has(key)) {
    return json({ success: false, error: 'Pixel already placed' }, { status: 400 });
  }
  balances.set(username, currentBalance - pixelCost);
  pixels.set(key, { color, link: link || undefined, user: username });
  return json({ success: true });
}