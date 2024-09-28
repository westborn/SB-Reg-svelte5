import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { REGISTRATIONS_OPEN } from '$lib/constants';

export const load: PageServerLoad = async (event) => {
	console.log(`${event.route.id} - LOAD - START Registrations:${REGISTRATIONS_OPEN}`);
	if (REGISTRATIONS_OPEN) {
		redirect(302, '/register/artist');
	}
};
