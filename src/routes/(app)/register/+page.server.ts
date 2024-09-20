import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { stillTakingRegistrations } from '$lib/constants';

export const load: PageServerLoad = async (event) => {
	console.log(`${event.route.id} - LOAD - START Registrations:${stillTakingRegistrations}`);
	if (stillTakingRegistrations) {
		redirect(302, '/register/artist');
	}
};
