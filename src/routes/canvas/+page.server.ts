import type { PageServerLoad } from './$types';
import { getUserFromEmail } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import { numberOfPixels } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();

	// const allowed_emails = ["ben.elliott.2021@gmail.com","web@niiccoo2.xyz"];
	const email = session?.user?.email ?? null;
	const slackID = session?.user?.slack_id ?? null;

	if (!email) {
		redirect(302, '/');
	}

	const user = await getUserFromEmail(email);

	const admin_viewer = user?.is_canvas_mod ?? false;

	const totalPixels = numberOfPixels(slackID ?? '');

	return {
		admin_viewer,
		slackID,
		totalPixels
	};
};
