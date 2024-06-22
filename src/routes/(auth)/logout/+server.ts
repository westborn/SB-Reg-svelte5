import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
	const supabase = event.locals.supabase;
	const { session } = await event.locals.V1safeGetSession();

	if (session) {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.log('logout:', error);
		}
	}
	redirect(302, '/login');
};
