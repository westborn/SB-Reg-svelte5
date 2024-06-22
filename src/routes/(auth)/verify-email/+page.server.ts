import { tokenSchema } from '$lib/zod-schemas';
import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { session, user } = await event.locals.V1safeGetSession();
	if (user) redirect(302, '/'); //already logged in so we have a valid email address in user
	return {
		session,
		user,
		form: await superValidate(zod(tokenSchema))
	};
};

export const actions = {
	default: async (event) => {
		const { supabase, V1safeGetSession } = event.locals;
		const { user } = await V1safeGetSession();
		if (user) redirect(302, '/');

		const form = await superValidate(event, zod(tokenSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		const { data, error } = await supabase.auth.verifyOtp({
			email: form.data.email,
			token: form.data.token,
			type: 'email'
		});

		if (error) {
			console.log('verify-email:', error);
			setError(form, 'token', error.message);
			return fail(400, {
				form
			});
		}
		console.log('verify-email:', data);
		redirect(302, '/');
	}
};
