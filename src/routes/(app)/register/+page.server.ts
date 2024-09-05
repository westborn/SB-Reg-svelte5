import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { stillTakingRegistrations } from '$lib/constants';

export const load: PageServerLoad = async () => {
	console.log('register +page.server.ts LOAD - START', stillTakingRegistrations);
	if (stillTakingRegistrations) {
		redirect(302, '/register/artist');
	}
};
