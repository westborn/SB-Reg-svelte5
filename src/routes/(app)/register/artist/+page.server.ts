import type { Actions, PageServerLoad } from './$types';
import type { RequestEvent } from './$types';

import { zod } from 'sveltekit-superforms/adapters';
import { message, superValidate } from 'sveltekit-superforms';
import { prisma } from '$lib/components/server/prisma';

import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_UNEXPECTED } from '$lib/constants';

import { artistSchemaUI } from '$lib/zod-schemas';
import { getSubmission, type User } from '$lib/components/server/registrationDB';

export const load: PageServerLoad = async (event) => {
	console.log(`${event.route.id} - LOAD - START`);
	return;
};

const artistUpdate = async (event: RequestEvent) => {
	const formValidationResult = await superValidate(event, zod(artistSchemaUI));
	if (!formValidationResult.valid) {
		return message(formValidationResult, 'Registration is Invalid - please reload and try again, or, call us!!', {
			status: 400
		});
	}
	const { user } = await event.locals.V1safeGetSession();
	// If the user is an admin, they can update any artist
	const artistEmail = user.isAdmin ? user.proxyEmail : user.email;

	try {
		const result = await prisma.artistTable.update({
			where: { email: artistEmail },
			data: formValidationResult.data
		});

		if (!result) {
			console.error(`${event.route.id} - ${GENERIC_ERROR_MESSAGE}`);
			return message(formValidationResult, GENERIC_ERROR_MESSAGE);
		}
	} catch (error) {
		console.error(`${event.route.id}`, error);
		return message(formValidationResult, GENERIC_ERROR_MESSAGE);
	}

	// Return the updated submission
	const updatedSubmission = await getSubmission(user as User);
	const returnData = { formValidationResult, updatedSubmission };
	return returnData;
};

const artistCreate = async (event: RequestEvent) => {
	console.log(`${event.route.id} - artistCreate - START`);
	const formValidationResult = await superValidate(event, zod(artistSchemaUI));
	if (!formValidationResult.valid) {
		return message(formValidationResult, 'Registration is Invalid - please reload and try again, or, call us!!', {
			status: 400
		});
	}

	const { user } = await event.locals.V1safeGetSession();
	// If the user is an admin, they can update any artist
	const artistEmail = user.isAdmin ? user.proxyEmail : user.email;
	const newArtist = { ...formValidationResult.data, email: artistEmail };

	try {
		const result = await prisma.artistTable.create({ data: newArtist });
		if (!result) {
			console.error(`${event.route.id} - ${GENERIC_ERROR_MESSAGE}`);
			return message(formValidationResult, GENERIC_ERROR_MESSAGE);
		}
	} catch (error) {
		console.error(`${event.route.id} - `, error);
		return message(formValidationResult, GENERIC_ERROR_UNEXPECTED);
	}

	// Return the updated submission
	const updatedSubmission = await getSubmission(user as User);
	const returnData = { formValidationResult, updatedSubmission };
	return returnData;
};

export const actions: Actions = { artistUpdate, artistCreate };
