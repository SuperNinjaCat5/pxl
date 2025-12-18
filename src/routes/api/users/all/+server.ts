import type { RequestHandler } from '@sveltejs/kit';
import { getUserFromEmail, addUser, getAllUsers } from '$lib/server/db';

export const GET: RequestHandler = async (event) => {
	// Checks if a user in the DB, if not adds them
	// this will check if the user exists and if not make an account
	const session = await event.locals.auth();

	// Require Login
	if (!session || !session.user?.email) {
		return new Response('Unauthorized', { status: 401 });
	}

	// Require Admin
	const email = session.user.email;
	const user = await getUserFromEmail(email);

	if (user?.is_admin != true) {
		return new Response('Unauthorized', { status: 401 });
	}

	console.log('got request for all users');

	const users = await getAllUsers();

	console.log('got all users');

	return new Response(JSON.stringify(users));
};
