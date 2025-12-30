import type { RequestHandler } from './$types';
import { HEIGHT, WIDTH, upsertPixel, numberOfPixels } from '$lib/server/db';
import { broadcast } from '$lib/server/pixelStream';
import { log_pxl } from '$lib/server/log';
import { log } from 'console';

const START_DATE: string = '2025-12-10';
const SEC_PER_PIXEL: number = 300;

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

	const { request } = event;
	const body = (await request.json()) as
		| {
				x?: number;
				y?: number;
				color?: string;
		  }
		| undefined;

	const { x, y, color } = body ?? {};

	if (x == null || y == null || !Number.isInteger(x) || !Number.isInteger(y)) {
		return jsonError('x and y must be integers', 400);
	}
	if (typeof color !== 'string' || !color) {
		return jsonError('color is required', 400);
	}
	if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) {
		return jsonError('out of bounds', 400);
	}

	const placed_by = session.user.email;
	const slack_id = session.user.slack_id;

	if (!slack_id) {
		return jsonError('Slack ID not found', 400);
	}

	const totalPixelsPlaced = await numberOfPixels(slack_id);
	const timeStats = await getTotalTime(slack_id);
	const totalTime = timeStats.total_seconds;

	const calculatedPixels = Math.floor(totalTime / SEC_PER_PIXEL - (totalPixelsPlaced ?? 0));
	const numberOfPlaceablePixels = Math.max(0, calculatedPixels);

	if (numberOfPlaceablePixels <= 0) {
		return jsonError('Not enough pixels', 400);
	}

	try {
		upsertPixel.run({
			x,
			y,
			color,
			placed_by,
			placed_at: Date.now()
		});

		if (slack_id) {
			await numberOfPixels(slack_id, true);
		}

		broadcast({
			x,
			y,
			color,
			placed_by
		});

		log_pxl('Placed pixel', x, y, color, session.user.email);

		return new Response(JSON.stringify({ ok: true }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err) {
		console.error('DB error in /api/pixels/place:', err);
		return jsonError('internal error', 500);
	}
};
