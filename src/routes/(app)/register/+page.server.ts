import { zod } from 'sveltekit-superforms/adapters';
import { fail, message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { artistPublicSchema } from '$lib/zod-schemas';
import { prisma } from '$lib/components/server/prisma';
import { getArtistCollection } from '$lib/components/server/artist';

export const load: PageServerLoad = async (event) => {
	console.log('(app)/register +page.server.ts', 'Commencing');
	const { session, user } = await event.locals.safeGetSession();
	console.log('loading (user is)', user);
	// if (!user) redirect(302, '/'); //already logged in so we have a valid email address in user

	const artistEmail = 'dulce21@example.com';
	const artistCollection = await getArtistCollection(artistEmail);

	return {
		artistCollection,
		form: await superValidate(artistCollection, zod(artistPublicSchema))
	};
};

export const actions: Actions = {
	updateArtist: async (event) => {
		// const { supabase, safeGetSession } = event.locals;

		// const { user } = await safeGetSession();
		// console.log('updateArtist (event is): ', Object.keys(event));
		// console.log('updateArtist (event is): ', JSON.stringify(event, null, 2));
		// console.log(
		// 	'updateArtist (params are): ',
		// 	Object.fromEntries(new URLSearchParams(event.url.search))
		// );
		// if (!user) redirect(302, '/');

		const form = await superValidate(event, zod(artistPublicSchema));
		// console.log('updateArtist (form is): ', form);
		// console.log('updateArtist (data is): ', data);
		if (!form.valid) return fail(400, { form });
		let result;
		try {
			const artistEmail = 'dulce21@example.com';
			result = await prisma.artistTable.update({
				where: { email: artistEmail },
				data: form.data
			});
			if (result) {
				// console.log('No error', result);
				return message(form, 'Successfully updated the profile.');
			}
		} catch (reason) {
			console.log('No reason - (app)/register +page.server.ts', reason);
			return message(form, "Something went wrong. Sorry, we're broken!.");
		}
		console.log('how did we get here (app)/register +page.server.ts', result);
		return message(form, 'Something went wrong. Please try again later.');
	}
};
