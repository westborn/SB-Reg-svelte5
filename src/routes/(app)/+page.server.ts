import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

//This is a phantom load, it doesn't have a +page.svelte to go with it.
//It just validates the user and redirects to the correct page.

export const load: PageServerLoad = async () => {
	console.log('(app)/+page.server.ts LOAD - DONE');
	redirect(302, '/register'); //got a user - go to register
};
