import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
	console.log('(auth)/logout server.ts', 'GET request Commencing');

	const supabase = event.locals.supabase;
	const { session } = await event.locals.safeGetSession();

	if (session) {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.log('logout:', error);
		}
	}
	redirect(302, '/');
};
