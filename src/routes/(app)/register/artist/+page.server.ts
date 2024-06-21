import { zod } from 'sveltekit-superforms/adapters';
import { message, superValidate } from 'sveltekit-superforms';
import { prisma } from '$lib/components/server/prisma';

import { artistAddOrUpdateSchema, entryCreateSchema } from '$lib/zod-schemas';
import type { Actions, PageServerLoad } from '../../$types';
import { getSubmission } from '$lib/components/server/registrationDB';
export const load: PageServerLoad = async (event) => {
	const { session, user } = await event.locals.safeGetSession();
	// if (!user) redirect(302, '/'); //already logged in so we have a valid email address in user
	console.log('Register +page.server.ts LOAD - START');

	const [createArtistForm, updateArtistForm, createEntryForm] = await Promise.all([
		superValidate(zod(artistAddOrUpdateSchema)),
		superValidate(zod(artistAddOrUpdateSchema)),
		superValidate(zod(entryCreateSchema))
	]);

	const artistEmail = 'full@example.com'; //TODO: replace with user.email

	const submission = await getSubmission(artistEmail);
	!submission ? console.log('No Submission Found') : console.log('Submission Found', submission.id);

	const form = await superValidate(submission, zod(artistAddOrUpdateSchema));
	return {
		submission,
		form,
		createArtistForm,
		updateArtistForm,
		createEntryForm
	};
};

export const actions: Actions = {
	updateArtist: async (event) => {
		const submissionId = event.url.searchParams.get('id');
		const form = await superValidate(event, zod(artistAddOrUpdateSchema));
		if (!form.valid) {
			return message(form, 'Registration is Invalid - please reload and try again, or, call us!!', {
				status: 400
			});
		}
		let result;
		try {
			const artistEmail = 'full@example.com'; //TODO: replace with user.email
			result = await prisma.artistTable.update({
				where: { email: artistEmail },
				data: form.data
			});
			console.log('Update Result:', result);
			if (result) {
				return message(form, 'Success');
			}
		} catch (reason) {
			console.log('Prisma Error? (app)/register +page.server.ts', reason);
			return message(form, "Something went wrong. Sorry, we're broken!");
		}
		console.log('Generic Error? (app)/register +page.server.ts', result);
		return message(form, 'Something went wrong. Please try again later.');
	},

	createArtist: async (event) => {
		const form = await superValidate(event, zod(artistAddOrUpdateSchema));
		console.log('Create Form:', form.data);
		if (!form.valid) {
			console.log('Registration is Invalid', form.data);
			return message(form, 'Registration is Invalid - please reload and try again, or, call us!!', {
				status: 400
			});
		}
		let result;
		const artistEmail = 'full@example.com';
		const newArtist = { ...form.data, email: artistEmail };
		try {
			result = await prisma.artistTable.create({
				data: newArtist
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
