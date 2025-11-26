import type { PageServerLoad } from './$types';
import { getUserFromEmail } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();

	const email = session?.user?.email ?? null;

	if (!email) {
		redirect(302, '/');
	}

	const user = getUserFromEmail.get({ email });

	const admin_viewer = user?.is_shop_edit ?? false;

	return {
		admin_viewer
	};
};
