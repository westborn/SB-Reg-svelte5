import type { PageServerLoad } from './$types';
import { getSubmission, type User } from '$lib/components/server/registrationDB';

export const load: PageServerLoad = async (event) => {
	const { user } = await event.locals.V1safeGetSession();
	const submission = await getSubmission(user as User);
	return { submission };
};
