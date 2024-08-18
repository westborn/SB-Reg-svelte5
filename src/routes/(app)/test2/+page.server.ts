import { redirect } from '@sveltejs/kit';
import { getSubmission } from '$lib/components/server/registrationDB';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { session, user } = await event.locals.V1safeGetSession();
	if (!user || !session) redirect(302, '/login');
	console.log(`${event.route.id} - LOAD - START`);

	const submission = await getSubmission(user.email);

	return { submission };
};
