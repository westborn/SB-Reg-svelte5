import { getExhibits } from '$lib/components/server/registrationDB';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	console.log(`${event.route.id} - LOAD - START`);
	try {
		const exhibits = await getExhibits({ rows: 999, offset: 0 });
		return { exhibits };

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		return { error: error.message };
	}
};
