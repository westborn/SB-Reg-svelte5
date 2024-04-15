import { registerSchema } from '$lib/zod-schemas';
import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async (event) => {
	// if (event.locals.user) redirect(302, '/');
	return {
		form: await superValidate(zod(registerSchema))
	};
};
