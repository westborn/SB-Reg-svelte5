import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { V1safeGetSession } }) => {
	const { session, user } = await V1safeGetSession();
	return {
		session,
		user
	};
};
