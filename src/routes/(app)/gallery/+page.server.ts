import { getExhibits } from '$lib/components/server/registrationDB';
import { EXHIBITION_YEAR } from '$lib/constants';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	//console.log(`${event.route.id} - LOAD - START`);
	const { user } = await event.locals.V1safeGetSession();
	const entryYear = event.url.searchParams.get('year') ?? '2025';
	// Only admins can see the current exhibition year entries
	if (entryYear.localeCompare(EXHIBITION_YEAR) === 0 && !user.isAdmin) {
		return { exhibits: [] };
	}
	try {
		const exhibits = await getExhibits({ rows: 999, offset: 0, entryYear });
		return { exhibits };

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		return { error: error.message };
	}
};
