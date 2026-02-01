import { getExhibits } from '$lib/components/server/registrationDB';
import { EXHIBITION_YEAR } from '$lib/constants';
import { logger } from '$lib/server/logger';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	try {
		const exhibits = await getExhibits({ rows: 999, offset: 0, entryYear: EXHIBITION_YEAR });
		return { exhibits };

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		await logger.error('Failed to load exhibits for accept page', error, {
			routeId: event.route.id
		});
		return { error: error.message };
	}
};
