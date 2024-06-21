import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { V1safeGetSession } }) => {
	const { session, user } = await V1safeGetSession();
	console.log('+layout.server.ts LOAD - DONE');
	console.log('layout', user ? 'yes' : 'no');
	return {
		session,
		user
	};
};
