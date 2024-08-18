import type { Actions, PageServerLoad } from './$types';
import type { RequestEvent } from './$types';

import { zod } from 'sveltekit-superforms/adapters';
import { redirect } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { prisma } from '$lib/components/server/prisma';

import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_UNEXPECTED, SUCCESS_MESSAGE } from '$lib/constants';

import { artistSchemaUI } from '$lib/zod-schemas';

export const load: PageServerLoad = async (event) => {
	const { session, user } = await event.locals.V1safeGetSession();
	if (!user || !session) redirect(302, '/login');
	console.log(`${event.route.id} - LOAD - START`);
	return;
};

const updateArtist = async (event: RequestEvent) => {
	const form = await superValidate(event, zod(artistSchemaUI));
	if (!form.valid) {
		return message(form, 'Registration is Invalid - please reload and try again, or, call us!!', { status: 400 });
	}
	const { session, user } = await event.locals.V1safeGetSession();
	if (!user || !session) return redirect(302, '/login');

	try {
		const artistEmail = user.email; // TODO Assuming email is the correct identifier
		console.log('updateArtist', artistEmail);
		const result = await prisma.artistTable.update({
			where: { email: artistEmail },
			data: form.data
		});

		if (!result) {
			console.log(`${event.route.id} - ${GENERIC_ERROR_MESSAGE}`);
			return message(form, GENERIC_ERROR_MESSAGE);
		}
	} catch (error) {
		console.log(`${event.route.id}`, error);
		return message(form, GENERIC_ERROR_MESSAGE);
	}

	return message(form, SUCCESS_MESSAGE);
};

const createArtist = async (event: RequestEvent) => {
	const form = await superValidate(event, zod(artistSchemaUI));
	if (!form.valid) {
		return message(form, 'Registration is Invalid - please reload and try again, or, call us!!', { status: 400 });
	}
	const { session, user } = await event.locals.V1safeGetSession();
	if (!user || !session) return redirect(302, '/login');

	const artistEmail = user.email; // TODO Ensure email is correctly identified
	const newArtist = { ...form.data, email: artistEmail };

	try {
		const result = await prisma.artistTable.create({ data: newArtist });
		if (!result) {
			console.log(`${event.route.id} - ${GENERIC_ERROR_MESSAGE}`);
			return message(form, GENERIC_ERROR_MESSAGE);
		}
	} catch (error) {
		console.log(`${event.route.id} - `, error);
		return message(form, GENERIC_ERROR_UNEXPECTED);
	}

	return message(form, SUCCESS_MESSAGE);
};

export const actions: Actions = { updateArtist, createArtist };
