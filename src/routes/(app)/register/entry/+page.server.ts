import type { Actions, PageServerLoad } from './$types';
import type { RequestEvent } from './$types';

import { zod } from 'sveltekit-superforms/adapters';
import { redirect } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { prisma } from '$lib/components/server/prisma';

import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_UNEXPECTED, SUCCESS_MESSAGE } from '$lib/constants';

import { entryAddOrUpdateSchema } from '$lib/zod-schemas';

export const load: PageServerLoad = async (event) => {
	const { session, user } = await event.locals.V1safeGetSession();
	if (!user || !session) redirect(302, '/login');
	console.log(`${event.route.id} - LOAD - START`);
	const entryForm = await superValidate(zod(entryAddOrUpdateSchema));
	return { entryForm };
};

const updateEntry = async (event: RequestEvent) => {
	const form = await superValidate(event, zod(entryAddOrUpdateSchema));
	if (!form.valid) {
		return message(form, 'Registration is Invalid - please reload and try again, or, call us!!', { status: 400 });
	}
	const { session, user } = await event.locals.V1safeGetSession();
	if (!user || !session) return redirect(302, '/login');

	try {
		const entryEmail = user.email; // TODO Assuming email is the correct identifier
		console.log('updateEntry', entryEmail);
		const result = await prisma.entryTable.update({
			where: { email: entryEmail },
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

const createEntry = async (event: RequestEvent) => {
	const form = await superValidate(event, zod(entryAddOrUpdateSchema));
	console.log('createEntry', form);
	if (!form.valid) {
		return message(form, 'Entry is Invalid - please reload and try again, or, call us!!', { status: 400 });
	}
	const { session, user } = await event.locals.V1safeGetSession();
	if (!user || !session) return redirect(302, '/login');

	const artistEmail = user.email; // TODO Ensure email is correctly identified
	console.log('createEntry', artistEmail);
	const newEntry = { ...form.data };
	console.log('newEntry', newEntry);
	return message(form, 'NONO!', { status: 400 });

	try {
		const result = await prisma.entryTable.create({ data: newEntry });
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

export const actions: Actions = { updateEntry, createEntry };
