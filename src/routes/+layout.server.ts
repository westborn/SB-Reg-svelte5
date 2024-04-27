// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession } }) => {
	console.log('+layout.server.ts', 'Commencing');
	const { session, user } = await safeGetSession();
	console.log('+layout.server.ts', 'Session:', { session, user });
	return {
		session,
		user
	};
};
