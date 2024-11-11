import { fail, redirect, type Actions, type RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getExhibits } from '$lib/components/server/registrationDB';
import { z } from 'zod';
import { artistTableSchema } from '$lib/zod-schemas';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

const emailSchema = z.object({ email: artistTableSchema.shape.email });

export const load: PageServerLoad = async (event) => {
	console.log(`${event.route.id} - LOAD - START`);
	const emailForm = await superValidate(zod(emailSchema), { id: 'emailForm' });
	const exhibits = await getExhibits({ rows: 999, offset: 0, entryYear: '2025' });
	return { emailForm, exhibits };
};

export const actions: Actions = {
	setArtistEmail: async (event: RequestEvent) => {
		const { request, cookies, locals } = event;
		const { user } = await locals.V1safeGetSession();

		const form = await superValidate(request, zod(emailSchema));
		if (!form.valid) {
			return message(form, 'Invalid email for artist.');
		}
		const proxyEmail = form.data.email;
		if (user.isSuperAdmin) {
			cookies.set('proxyEmail', proxyEmail, {
				path: '/',
				maxAge: 60 * 60 * 24 * 365,
				httpOnly: false // <-- if you want to read it in the browser
			});
			redirect(302, '/admin');
		}
		return fail(400, { error: 'Invalid login or password' });
	}
};
