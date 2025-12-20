import type { PageServerLoad } from './$types';
import { getUserFromEmail } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import { numberOfPixels } from '$lib/server/db';

const START_DATE: string = '2025-12-10';

async function getTotalTime(slackID: string) {
	try {
		const res = await fetch(
			`https://hackatime.hackclub.com/api/v1/users/${slackID}/stats?start_date=${START_DATE}T00:00:00`
		);
		if (!res.ok) throw new Error(`API error: ${res.status}`);
		const json = await res.json();

		return {
			total_seconds: json.data.total_seconds,
			human_readable_total: json.data.human_readable_total
		};
	} catch (e) {
		console.error('Error fetching time:', e);
		return { total_seconds: 0, human_readable_total: '0s' };
	}
}

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

	const totalPixelsPlaced = await numberOfPixels(slackID ?? '');
	const timeStats = await getTotalTime(slackID ?? '');

	return {
		admin_viewer,
		slackID,
		totalPixelsPlaced,
		totalTime: timeStats.total_seconds,
		readableTime: timeStats.human_readable_total
	};
};
