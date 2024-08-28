import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

import { getSubmission } from '$lib/components/server/registrationDB';

export const load: PageServerLoad = async (event) => {
	const { session, user } = await event.locals.V1safeGetSession();
	if (!user || !session) redirect(302, '/login');
	// console.log(`${event.route.id} - LOAD - START`);

	const artistEmail = user.email; // TODO Ensure email is correctly identified
	const submission = await getSubmission(artistEmail);
	return { submission };
};
