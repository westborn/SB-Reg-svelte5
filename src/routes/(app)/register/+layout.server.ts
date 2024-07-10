import { redirect } from '@sveltejs/kit';
import { getSubmission } from '$lib/components/server/registrationDB';
import type { LayoutServerLoad } from '../$types';

export const load: LayoutServerLoad = async (event) => {
	const { session, user } = await event.locals.V1safeGetSession();
	if (!user || !session) redirect(302, '/login');
	console.log('register +layout.server.ts LOAD - START');

	const submission = await getSubmission(user.email);
	!submission ? console.log('No Submission Found') : console.log('Submission Found', submission.id);

	return { submission };
};
