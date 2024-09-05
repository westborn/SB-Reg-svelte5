import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { V1safeGetSession } }) => {
	const { user } = await V1safeGetSession();
	return {
		user
	};
};
