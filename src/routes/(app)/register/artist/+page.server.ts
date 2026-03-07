import type { Actions } from './$types';
import type { RequestEvent } from './$types';

import { zod4 } from 'sveltekit-superforms/adapters';
import { message, superValidate } from 'sveltekit-superforms';

import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_UNEXPECTED } from '$lib/constants';

import { artistSchemaUI } from '$lib/zod-schemas';
import { createArtist, getSubmission, updateArtist, type User } from '$lib/components/server/registrationDB';
import { getArtistEmail, returnWithUpdatedSubmission } from '$lib/server/helpers';
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
	const artistEmail = getArtistEmail(user as User);

	try {
		const submissionFromDb = await getSubmission(user as User);
		const artist = submissionFromDb ? { id: submissionFromDb.id } : null;

		if (!artist) {
			return message(formValidationResult, GENERIC_ERROR_MESSAGE);
		}

		await updateArtist(artist.id, formValidationResult.data);

		// Log successful update
		await logger.info('Artist updated successfully', {
			userId: user.id,
			userEmail: artistEmail,
			artistId: artist.id,
			routeId: event.route.id,
			...(user.isSuperAdmin && {
				adminAction: true,
				adminEmail: user.email,
				targetArtistEmail: user.proxyEmail
			})
		});
	} catch (error) {
		await logger.error('Artist update failed', error as Error, {
			userId: user.id,
			userEmail: artistEmail,
			routeId: event.route.id,
			...(user.isSuperAdmin && {
				adminAction: true,
				adminEmail: user.email,
				targetArtistEmail: user.proxyEmail
			})
		});
		return message(formValidationResult, GENERIC_ERROR_MESSAGE);
	}

	// Return the updated submission
	const updatedSubmission = await getSubmission(user as User);
	return returnWithUpdatedSubmission(formValidationResult, updatedSubmission);
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
	const artistEmail = getArtistEmail(user as User);
	const newArtist = { ...formValidationResult.data, email: artistEmail };

	try {
		const createdArtist = await createArtist(newArtist);

		// Log successful creation
		await logger.info('Artist created successfully', {
			userId: user.id,
			userEmail: artistEmail,
			artistId: createdArtist.id,
			routeId: event.route.id,
			...(user.isSuperAdmin && {
				adminAction: true,
				adminEmail: user.email,
				targetArtistEmail: user.proxyEmail
			})
		});
	} catch (error) {
		await logger.error('Artist creation failed', error as Error, {
			userId: user.id,
			userEmail: artistEmail,
			routeId: event.route.id,
			...(user.isSuperAdmin && {
				adminAction: true,
				adminEmail: user.email,
				targetArtistEmail: user.proxyEmail
			})
		});
		return message(formValidationResult, GENERIC_ERROR_UNEXPECTED);
	}

	// Return the updated submission
	const updatedSubmission = await getSubmission(user as User);
	return returnWithUpdatedSubmission(formValidationResult, updatedSubmission);
};

export const actions: Actions = { artistUpdate, artistCreate };
