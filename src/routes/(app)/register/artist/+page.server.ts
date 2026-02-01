import type { Actions } from './$types';
import type { RequestEvent } from './$types';

import { zod4 } from 'sveltekit-superforms/adapters';
import { message, superValidate } from 'sveltekit-superforms';
import { prisma } from '$lib/components/server/prisma';

import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_UNEXPECTED } from '$lib/constants';

import { artistSchemaUI } from '$lib/zod-schemas';
import { getSubmission, updateArtist, type User } from '$lib/components/server/registrationDB';
import { logger } from '$lib/server/logger';

const artistUpdate = async (event: RequestEvent) => {
	const formValidationResult = await superValidate(event, zod4(artistSchemaUI));
	if (!formValidationResult.valid) {
		return message(formValidationResult, 'Registration is Invalid - please reload and try again, or, call us!!', {
			status: 400
		});
	}
	const { user } = await event.locals.V1safeGetSession();
	// If the user is an admin, they can update any artist
	const artistEmail = user.isSuperAdmin ? user.proxyEmail : user.email;

	try {
		// Find the artist by email to get their ID
		const artist = await prisma.artistTable.findUnique({
			where: { email: artistEmail },
			select: { id: true }
		});

		if (!artist) {
			return message(formValidationResult, GENERIC_ERROR_MESSAGE);
		}

		await updateArtist(artist.id, formValidationResult.data);

		// Log successful update
		await logger.info('Artist updated successfully', {
			userEmail: artistEmail,
			artistId: artist.id,
			routeId: event.route.id
		});
	} catch (error) {
		await logger.error('Artist update failed', error as Error, {
			userEmail: artistEmail,
			routeId: event.route.id
		});
		return message(formValidationResult, GENERIC_ERROR_MESSAGE);
	}

	// Return the updated submission
	const updatedSubmission = await getSubmission(user as User);
	const returnData = { formValidationResult, updatedSubmission };
	return returnData;
};

const artistCreate = async (event: RequestEvent) => {
	const formValidationResult = await superValidate(event, zod4(artistSchemaUI));
	if (!formValidationResult.valid) {
		return message(formValidationResult, 'Registration is Invalid - please reload and try again, or, call us!!', {
			status: 400
		});
	}

	const { user } = await event.locals.V1safeGetSession();
	// If the user is an admin, they can update any artist
	const artistEmail = user.isSuperAdmin ? user.proxyEmail : user.email;
	const newArtist = { ...formValidationResult.data, email: artistEmail };

	try {
		const createdArtist = await prisma.artistTable.create({ data: newArtist });

		// Log successful creation
		await logger.info('Artist created successfully', {
			userEmail: artistEmail,
			artistId: createdArtist.id,
			routeId: event.route.id
		});
	} catch (error) {
		await logger.error('Artist creation failed', error as Error, {
			userEmail: artistEmail,
			routeId: event.route.id
		});
		return message(formValidationResult, GENERIC_ERROR_UNEXPECTED);
	}

	// Return the updated submission
	const updatedSubmission = await getSubmission(user as User);
	const returnData = { formValidationResult, updatedSubmission };
	return returnData;
};

export const actions: Actions = { artistUpdate, artistCreate };
