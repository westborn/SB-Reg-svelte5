import { zod } from 'sveltekit-superforms/adapters';
import { fail, message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { artistPublicSchema } from '$lib/zod-schemas';
import { prisma } from '$lib/components/server/prisma';
import { getArtistCollection } from '$lib/components/server/artist';

export const load: PageServerLoad = async (event) => {
	const { session, user } = await event.locals.safeGetSession();
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
		const form = await superValidate(event, zod(artistPublicSchema));
		if (!form.valid) return fail(400, { form });
		let result;
		try {
			const artistEmail = 'dulce21@example.com';
			result = await prisma.artistTable.update({
				where: { email: artistEmail },
				data: form.data
			});
			if (result) {
				return message(form, 'Successfully updated the profile.');
			}
		} catch (reason) {
			console.log('Prisma Error? (app)/register +page.server.ts', reason);
			return message(form, "Something went wrong. Sorry, we're broken!.");
		}
		console.log('Generic Error? (app)/register +page.server.ts', result);
		return message(form, 'Something went wrong. Please try again later.');
	}
};
