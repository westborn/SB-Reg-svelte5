import { zod } from 'sveltekit-superforms/adapters';
import { message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { artistUpdateSchema } from '$lib/zod-schemas';
import { prisma } from '$lib/components/server/prisma';
import { getSubmission } from '$lib/components/server/artist';

export const load: PageServerLoad = async (event) => {
	const { session, user } = await event.locals.safeGetSession();
	// if (!user) redirect(302, '/'); //already logged in so we have a valid email address in user
	const artistEmail = 'dulce21@example.com1'; //TODO: replace with user.email

	const submission = await getSubmission(artistEmail);
	console.log(submission);
	console.log('(app)/register/+page.server.ts LOAD - DONE');
	const form = await superValidate(submission, zod(artistUpdateSchema));
	return {
		submission,
		form
	};
};

export const actions: Actions = {
	updateArtist: async (event) => {
		const form = await superValidate(event, zod(artistUpdateSchema));
		if (!form.valid) {
			console.log('Registration is Invalid', form.data);
			return message(form, 'Registration is Invalid - please reload and try again, or, call us!!', {
				status: 400
			});
		}
		let result;
		try {
			const artistEmail = 'dulce21@example.com';
			result = await prisma.artistTable.update({
				where: { email: artistEmail },
				data: form.data
			});
			if (result) {
				return message(form, 'Success');
			}
		} catch (reason) {
			console.log('Prisma Error? (app)/register +page.server.ts', reason);
			return message(form, "Something went wrong. Sorry, we're broken!");
		}
		console.log('Generic Error? (app)/register +page.server.ts', result);
		return message(form, 'Something went wrong. Please try again later.');
	}
};
