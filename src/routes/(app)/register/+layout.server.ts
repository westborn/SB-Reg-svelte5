import { getSubmission, type User } from '$lib/components/server/registrationDB';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const { user } = await event.locals.V1safeGetSession();

	const submission = await getSubmission(user as User);
	if (submission && submission.registrations.length > 0 && submission?.registrations[0].closed) {
		redirect(307, '/view');
	}
	return { submission };
};
