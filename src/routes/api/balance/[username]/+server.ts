import { balances } from '$lib/balances';
import { json } from '@sveltejs/kit';

export async function GET({ params }) {
  const username = params.username;
  const balance = balances.get(username) || 0;
  return json({ balance });
}