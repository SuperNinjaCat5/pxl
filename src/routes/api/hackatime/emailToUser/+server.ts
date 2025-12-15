import type { RequestHandler } from '@sveltejs/kit';
import { HACKATIME_API_KEY } from '$env/static/private';
import { json, error } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const email = url.searchParams.get('email');

	if (!email) {
		return error(400, 'Email parameter is required');
	}

	const response = await fetch(
		`https://hackatime.hackclub.com/api/v1/users/lookup_email/${email}`,
		{
			method: 'GET',
			headers: {
				Authorization: `Bearer ${HACKATIME_API_KEY}`,
				'Content-Type': 'application/json'
			}
		}
	);

	if (!response.ok) {
		return error(response.status, 'Failed to fetch Hackatime user');
	}

	const data = await response.json();
	return json(data);
};
