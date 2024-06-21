import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession } }) => {
	const { session, user } = await safeGetSession();
	console.log('+layout.server.ts LOAD - DONE');
	console.log('layout', user ? 'yes' : 'no');
	return {
		session,
		user
	};
};
