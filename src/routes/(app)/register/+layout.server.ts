import { redirect } from '@sveltejs/kit';
import { getSubmission } from '$lib/components/server/registrationDB';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const { session, user } = await event.locals.V1safeGetSession();
	if (!user || !session) redirect(302, '/login');
	console.log('register +layout.server.ts LOAD - START');

	const submission = await getSubmission(user.email);
	if (!submission) {
		console.log('No Submission Found');
	} else {
		if (submission && submission.registrations.length === 0) {
			console.log('No Registrations Found');
		} else {
			console.log(`Submission Found ${submission.id} with ${submission?.registrations[0]?.entries?.length}`);
		}
	}

	return { submission };
};
