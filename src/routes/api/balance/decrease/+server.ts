import { balances } from '$lib/balances';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
  const { username, amount } = await request.json();
  const current = balances.get(username) || 0;
  if (current >= amount) {
    balances.set(username, current - amount);
    return json({ success: true });
  } else {
    return json({ success: false, error: 'Insufficient balance' }, { status: 400 });
  }
}