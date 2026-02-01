import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { REGISTRATIONS_OPEN } from '$lib/constants';

export const load: PageServerLoad = async (event) => {
	if (REGISTRATIONS_OPEN) {
		redirect(302, '/register/artist');
	}
	const { user } = await event.locals.V1safeGetSession();
	if (user.isSuperAdmin) {
		redirect(302, '/register/artist');
	}
};
