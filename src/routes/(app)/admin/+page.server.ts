import { fail, redirect, type Actions, type RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { session, user } = await event.locals.V1safeGetSession();
	if (!user || !session) redirect(302, '/login');
	console.log(`${event.route.id} - LOAD - START`);
	return;
};

export const actions: Actions = {
	default: async (event: RequestEvent) => {
		const { request, cookies, locals } = event;
		const { user } = await locals.V1safeGetSession();
		const formData = await request.formData();
		const proxyEmail = formData.get('proxyEmail') as string;
		console.log('proxyEmail', proxyEmail);
		console.log('proxyUser:', user.email);
		if (user.isAdmin) {
			cookies.set('proxyEmail', proxyEmail, {
				path: '/',
				maxAge: 60 * 60 * 24 * 365
				// httpOnly: false // <-- if you want to read it in the browser
			});
			redirect(302, '/admin');
		}
		return fail(400, { error: 'Invalid login or password' });
	}
};
