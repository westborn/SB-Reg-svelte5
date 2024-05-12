import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession } }) => {
	const { session, user } = await safeGetSession();
	console.log('+layout.server.ts LOAD - DONE');
	return {
		session,
		user
	};
};
