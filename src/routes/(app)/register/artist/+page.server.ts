import { zod } from 'sveltekit-superforms/adapters';
import { message, superValidate } from 'sveltekit-superforms';
import { prisma } from '$lib/components/server/prisma';

import { redirect } from '@sveltejs/kit';
import { artistAddOrUpdateSchema, entryCreateSchema } from '$lib/zod-schemas';
import type { Actions, PageServerLoad } from '../../$types';
import { getSubmission } from '$lib/components/server/registrationDB';

export const load: PageServerLoad = async (event) => {
	const { session, user } = await event.locals.V1safeGetSession();
	if (!user || !session) redirect(302, '/login');
	console.log('Register +page.server.ts LOAD - START');

	const [createArtistForm, updateArtistForm, createEntryForm] = await Promise.all([
		superValidate(zod(artistAddOrUpdateSchema)),
		superValidate(zod(artistAddOrUpdateSchema)),
		superValidate(zod(entryCreateSchema))
	]);

	const artistEmail = user.email; //TODO: SB email?

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
		const { session, user } = await event.locals.V1safeGetSession();
		if (!user || !session) redirect(302, '/login');
		const form = await superValidate(event, zod(artistAddOrUpdateSchema));
		if (!form.valid) {
			return message(form, 'Registration is Invalid - please reload and try again, or, call us!!', {
				status: 400
			});
		}
		let result;
		try {
			const artistEmail = user.email; //TODO: SB email?
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
		const { session, user } = await event.locals.V1safeGetSession();
		if (!user || !session) redirect(302, '/login');
		let result;
		const artistEmail = user.email; //TODO: SB email?
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
