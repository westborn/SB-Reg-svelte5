import type { Actions, PageServerLoad } from '../entry/$types';
import type { RequestEvent } from '../entry/$types';

import { zod } from 'sveltekit-superforms/adapters';
import { redirect } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { prisma } from '$lib/components/server/prisma';

import { GENERIC_ERROR_MESSAGE } from '$lib/constants';
import { confirmSchemaUI } from '$lib/zod-schemas';
import { getSubmission, type User } from '$lib/components/server/registrationDB';

export const load: PageServerLoad = async (event) => {
	const { session, user } = await event.locals.V1safeGetSession();
	if (!user || !session) redirect(302, '/login');
	console.log(`${event.route.id} - LOAD - START`);
	return;
};

const confirmUpdate = async (event: RequestEvent) => {
	const formValidationResult = await superValidate(event, zod(confirmSchemaUI));

	if (!formValidationResult.valid) {
		return message(formValidationResult, 'Confirm Details are Invalid - please reload and try again, or, call us!!', {
			status: 400
		});
	}
	const { session, user } = await event.locals.V1safeGetSession();
	if (!user || !session) return redirect(302, '/login');

	console.log('About to update confirm');

	// If the user is an admin, they can update any artist
	const artistEmail = user.isAdmin ? user.proxyEmail : user.email;
	let idToUpdate: number;
	// Get the submission from the database
	try {
		const submissionFromDB = await getSubmission(user as User);
		if (!submissionFromDB) {
			console.error(`${event.route.id} - Getting DB Submission${GENERIC_ERROR_MESSAGE}`);
			return message(formValidationResult, GENERIC_ERROR_MESSAGE);
		}
		idToUpdate = submissionFromDB.registrations[0].id;
		const {
			bumpIn,
			bumpOut,
			crane,
			displayRequirements,
			accommodation,
			transport,
			bankAccountName,
			bankBSB,
			bankAccount
		} = formValidationResult.data;

		const updatedRegistration = await prisma.registrationTable.update({
			where: { id: idToUpdate },
			data: {
				bumpIn: bumpIn ?? '',
				bumpOut: bumpOut ?? '',
				crane: crane === 'Yes' ? true : false,
				displayRequirements: displayRequirements ?? '',
				accommodation: accommodation === 'Yes' ? true : false,
				transport: transport === 'Yes' ? true : false
			}
		});
		if (!updatedRegistration) {
			console.error(`${event.route.id} - ${GENERIC_ERROR_MESSAGE}`);
			return message(formValidationResult, GENERIC_ERROR_MESSAGE);
		}

		const updatedArtist = await prisma.artistTable.update({
			where: { email: artistEmail },
			data: {
				bankAccountName: bankAccountName ?? '',
				bankBSB: bankBSB ?? '',
				bankAccount: bankAccount ?? ''
			}
		});
		if (!updatedArtist) {
			console.error(`${event.route.id} - ${GENERIC_ERROR_MESSAGE}`);
			return message(formValidationResult, GENERIC_ERROR_MESSAGE);
		}
		console.log('Confirm updated successfully', updatedRegistration, updatedArtist);
	} catch (error) {
		console.error(`${event.route.id}`, error);
		return message(formValidationResult, GENERIC_ERROR_MESSAGE);
	}

	// Return the updated submission
	const updatedSubmission = await getSubmission(user as User);
	const returnData = { formValidationResult, updatedSubmission };
	return returnData;
};

export const actions: Actions = { confirmUpdate };
