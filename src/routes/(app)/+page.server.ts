import { superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	const { session, user } = await event.locals.safeGetSession();
	console.log('(app) +page.server.ts', user);
	if (!user) redirect(302, '/login'); //no user - register or login
	return { session, user };
};
