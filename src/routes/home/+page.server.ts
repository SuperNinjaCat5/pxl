import type { PageServerLoad } from './$types';
import { getUserFromEmail } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ fetch, locals }) => {
	const session = await locals.auth();

	const email = session?.user?.email;
	if (!email) {
		throw redirect(302, '/');
	}

	const user = await getUserFromEmail(email);

	const admin_viewer = user?.is_admin ?? false;

	const res = await fetch('/api/users/check');

	return {
		admin_viewer
	};
};
