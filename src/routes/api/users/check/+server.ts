import type { RequestHandler } from '@sveltejs/kit';
import { getUserFromEmail, addUser } from '$lib/server/db';

export const GET: RequestHandler = async (event) => {
	// this will check if the user exists and if not make an account
	const session = await event.locals.auth();

	if (!session || !session.user?.email) {
		return new Response('Unauthorized', { status: 401 });
	}

	const email = session.user.email;
	const slack_id = session.user.id as string;

	console.log('got request to check user');

	const User = await getUserFromEmail(email);
	if (User != null) {
		// Check if user exists
		console.log('user exists');
		return new Response(JSON.stringify({ message: 'user exists' }));
	}

	await addUser({ email, slack_id });
	// admin level is just for now, i will update the db to have bools for canvas edit, ship edit, shop edit, supa-admin
	console.log('added user');

	return new Response(JSON.stringify({ message: 'added user' }));
};
