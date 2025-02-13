import { getExhibits } from '$lib/components/server/registrationDB';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	//console.log(`${event.route.id} - LOAD - START`);
	const entryYear = event.url.searchParams.get('year') ?? '2025';
	try {
		const exhibits = await getExhibits({ rows: 999, offset: 0, entryYear });
		return { exhibits };

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.log('error: ', error.message);
		return { error: error.message };
	}
};
