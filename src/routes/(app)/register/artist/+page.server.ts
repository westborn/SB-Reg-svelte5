import { zod } from 'sveltekit-superforms/adapters';
import { message, superValidate } from 'sveltekit-superforms';
import { prisma } from '$lib/components/server/prisma';

import { redirect } from '@sveltejs/kit';
import { artistAddOrUpdateSchema } from '$lib/zod-schemas';
import type { Actions, PageServerLoad } from '../$types';

export const load: PageServerLoad = async (event) => {
	const { session, user } = await event.locals.V1safeGetSession();
	if (!user || !session) redirect(302, '/login');
	console.log('register/artist +page.server.ts LOAD - START');
	return;
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
			console.log('updateArtist', artistEmail);
			result = await prisma.artistTable.update({
				where: { email: artistEmail },
				data: form.data
			});
			if (result) {
				return message(form, 'Success');
			}
		} catch (reason) {
			console.log('Prisma Error? (app)/register/artist +page.server.ts', reason);
			return message(form, "Something went wrong. Sorry, we're broken!");
		}
		console.log('Generic Error? (app)/register/artist +page.server.ts', result);
		return message(form, 'Something went wrong. Please try again later.');
	},

	createArtist: async (event) => {
		const form = await superValidate(event, zod(artistAddOrUpdateSchema));
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
		console.log('createArtist', artistEmail);
		const newArtist = { ...form.data, email: artistEmail };
		try {
			result = await prisma.artistTable.create({
				data: newArtist
			});
			if (result) {
				return message(form, 'Success');
			}
		} catch (reason) {
			console.log('Prisma Error? (app)/register/artist +page.server.ts - create', reason);
			return message(form, "Something went wrong. Sorry, we're broken!");
		}
		console.log('Generic Error? (app)/register/artist +page.server.ts - create', result);
		return message(form, 'Something went wrong. Please try again later.');
	}
};
