import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { session, user } = await event.locals.V1safeGetSession();
	console.log('(app)/register/+page.server.ts LOAD - DONE');
	console.log('user', user ? 'yes' : 'no');
	console.log('session', session ? 'yes' : 'no');
	if (!user || !session) redirect(302, '/login'); //no user so ask for login
	return {
		session,
		user
	};
};
