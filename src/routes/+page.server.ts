import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	const logged_in = Boolean(session?.user?.email);

	return {
		logged_in
	};
};
