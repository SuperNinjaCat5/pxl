// src/routes/api/pixels/place/+server.ts
import type { RequestHandler } from './$types';
import { HEIGHT, WIDTH, getUserFromEmail, upsertPixel } from '$lib/server/db';

function jsonError(message: string, status: number) {
	return new Response(JSON.stringify({ error: message }), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}

export const POST: RequestHandler = async (event) => {
	const session = await event.locals.auth();

	// Require login
	if (!session || !session.user?.email) {
		return jsonError('Unauthorized', 401);
	}

	// Require Admin
	const email = session.user.email;
	var accessingUser = getUserFromEmail.get({ email });

	if (accessingUser.is_admin != true) {
		return new Response('Unauthorized', { status: 401 });
	}

	const { request } = event;
	const body = (await request.json()) as
		| {
				user_email?: string;
				user_id?: number;
				slack_id?: string;
				slack_name?: string;
		  }
		| undefined;

	if (body?.user_email) {
		const user = getUserFromEmail.get({ email: body.user_email });
		console.log('got user: ', user);
		return new Response(JSON.stringify(user), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	console.log('No user found');
	return new Response(JSON.stringify({ ok: false, message: 'user not found' }), {
		status: 404,
		headers: { 'Content-Type': 'application/json' }
	});
};
