import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

import { getSubmission, type User } from '$lib/components/server/registrationDB';

export const load: PageServerLoad = async (event) => {
	const { session, user } = await event.locals.V1safeGetSession();
	if (!user || !session) redirect(302, '/login');
	// console.log(`${event.route.id} - LOAD - START`);

	const submission = await getSubmission(user as User);
	return { submission };
};
