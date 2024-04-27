// src/routes/(app)/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession } }) => {
	console.log('(*app)+layout.server.ts', 'Commencing');
	const { session, user } = await safeGetSession();
	console.log('(app)+layout.server.ts', 'Session:', { session, user });
	return {
		session,
		user
	};
};
