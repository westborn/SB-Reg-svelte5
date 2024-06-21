import { signupSchema } from '$lib/zod-schemas';
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
		form: await superValidate(zod(signupSchema))
	};
};

export const actions = {
	default: async (event) => {
		const { supabase, V1safeGetSession } = event.locals;
		const { user } = await V1safeGetSession();
		if (user) redirect(302, '/');

		const form = await superValidate(event, zod(signupSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		const url = new URL(event.request.url);
		const { data, error } = await supabase.auth.signInWithOtp({
			email: form.data.email,
			options: {
				emailRedirectTo: `${url.origin}/auth/callback`,
				shouldCreateUser: true
			}
		});

		if (error) {
			console.log('signup:', error);
			setError(form, 'email', error.message);
			return fail(400, {
				form
			});
		}
		console.log('signup:', data);
		redirect(302, '/verify-email');
	}
};
