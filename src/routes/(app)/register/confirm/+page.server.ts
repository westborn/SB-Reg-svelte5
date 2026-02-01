import type { Actions, PageServerLoad } from '../entry/$types';
import type { RequestEvent } from '../entry/$types';

import { zod4 } from 'sveltekit-superforms/adapters';
import { message, superValidate } from 'sveltekit-superforms';
import { prisma } from '$lib/components/server/prisma';

import { GENERIC_ERROR_MESSAGE } from '$lib/constants';
import { confirmSchemaUI } from '$lib/zod-schemas';
import { getSubmission, updateArtist, updateRegistration, type User } from '$lib/components/server/registrationDB';

export const load: PageServerLoad = async (event) => {
	return;
};

const confirmUpdate = async (event: RequestEvent) => {
	const formValidationResult = await superValidate(event, zod4(confirmSchemaUI));
	if (!formValidationResult.valid) {
		return message(formValidationResult, 'Confirm Details are Invalid - please reload and try again, or, call us!!', {
			status: 400
		});
	}
	const { user } = await event.locals.V1safeGetSession();
	// If the user is an admin, they can update any artist
	const artistEmail = user.isSuperAdmin ? user.proxyEmail : user.email;
	let idToUpdate: number;
	// Get the submission from the database
	try {
		const submissionFromDB = await getSubmission(user as User);
		if (!submissionFromDB) {
			return message(formValidationResult, GENERIC_ERROR_MESSAGE);
		}
		idToUpdate = submissionFromDB.registrations[0].id;
		const { bumpIn, bumpOut, crane, displayRequirements, bankAccountName, bankBSB, bankAccount } =
			formValidationResult.data;

		// Wrap both updates in transaction to ensure atomicity
		await prisma.$transaction(async (tx) => {
			await updateRegistration(idToUpdate, {
				bumpIn: bumpIn ?? null,
				bumpOut: bumpOut ?? null,
				crane: crane === 'Yes' ? true : false,
				displayRequirements: displayRequirements ?? null
			});

			const artist = await prisma.artistTable.findUnique({
				where: { email: artistEmail },
				select: { id: true }
			});

			if (artist) {
				await updateArtist(artist.id, {
					bankAccountName: bankAccountName ?? '',
					bankBSB: bankBSB ?? '',
					bankAccount: bankAccount ?? ''
				});
			}
		});
	} catch (error) {
		return message(formValidationResult, GENERIC_ERROR_MESSAGE);
	}

	// Return the updated submission
	const updatedSubmission = await getSubmission(user as User);
	const returnData = { formValidationResult, updatedSubmission };
	return returnData;
};

export const actions: Actions = { confirmUpdate };
