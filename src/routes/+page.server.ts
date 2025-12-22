import type { PageServerLoad } from './$types';
import { getUserFromEmail } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ fetch, locals }) => {
	const session = await locals.auth();

	const email = session?.user?.email;

	let signedIn: boolean = false;
	let adminViewer: boolean = false;

	if (!email) {
		// throw redirect(302, '/');
		signedIn = false;
	} else {
		signedIn = true;

		const user = await getUserFromEmail(email);

		adminViewer = user?.is_admin ?? false;

		const res = await fetch('/api/users/check');

		console.log('id is ' + user?.slack_id);
	}

	return {
		adminViewer,
		signedIn
	};
};
