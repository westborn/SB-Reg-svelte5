import type { RequestEvent } from './$types';
import { getExhibits } from '$lib/components/server/registrationDB';
import { EXHIBITION_YEAR } from '$lib/constants';

export async function POST(event: RequestEvent) {
	const { request, locals } = event;
	const { entryYear } = await request.json();
	let exhibits = [];

	if (!entryYear) {
		return new Response(JSON.stringify({ message: 'Error in getExhibits - no entryYear' }), { status: 500 });
	}
	const { user } = await locals.V1safeGetSession();
	// Only admins can see the current exhibition year entries
	if (entryYear.localeCompare(EXHIBITION_YEAR) === 0 && !user.isAdmin) {
		exhibits = [];
	}
	try {
		exhibits = await getExhibits({ rows: 999, offset: 0, entryYear });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.log('Error in getExhibits:', error.message);
		return new Response(JSON.stringify({ message: 'Error in getExhibits' }), { status: 500 });
	}
	return new Response(JSON.stringify(exhibits), { status: 200 });
}
