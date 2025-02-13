import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { REGISTRATIONS_OPEN } from '$lib/constants';

export const load: PageServerLoad = async (event) => {
	//console.log(`${event.route.id} - LOAD - START Registrations:${REGISTRATIONS_OPEN}`);
	if (REGISTRATIONS_OPEN) {
		redirect(302, '/register/artist');
	}
	const { user } = await event.locals.V1safeGetSession();
	console.log(`User: ${user.email} - ${user.isSuperAdmin}`);
	if (user.isSuperAdmin) {
		redirect(302, '/register/artist');
	}
};
