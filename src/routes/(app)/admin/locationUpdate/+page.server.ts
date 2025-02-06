import { getExhibits } from '$lib/components/server/registrationDB';
import { locationSchemaUi } from '$lib/zod-schemas';

import { EXHIBITION_YEAR } from '$lib/constants';
import type { Actions, PageServerLoad, RequestEvent } from '../$types';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async (event) => {
	console.log(`${event.route.id} - LOAD - START`);
	try {
		const exhibits = await getExhibits({ rows: 999, offset: 0, entryYear: EXHIBITION_YEAR });
		// return exhibits sorted by entryId
		// and the location data entry form
		return {
			exhibits: exhibits.sort((a, b) => a.entryId - b.entryId),
			locationForm: await superValidate(zod(locationSchemaUi))
		};

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.log('error: ', error.message);
		return { error: error.message };
	}
};

// const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again later.';
// const GENERIC_ERROR_UNEXPECTED = "Something went wrong. Sorry, we're broken!";

const locationUpdate = async (event: RequestEvent) => {
	await new Promise((r) => setTimeout(r, 2000));
	const formValidationResult = await superValidate(event, zod(locationSchemaUi));
	if (!formValidationResult.valid) {
		return message(formValidationResult, 'Registration is Invalid - please reload and try again, or, call us!!', {
			status: 400
		});
	}
	return message(formValidationResult, { newLocation: formValidationResult.data.location });

	// try {
	// 	const result = await prisma.artistTable.update({
	// 		where: { email: artistEmail },
	// 		data: formValidationResult.data
	// 	});

	// 	if (!result) {
	// 		console.error(`${event.route.id} - ${GENERIC_ERROR_MESSAGE}`);
	// 		return message(formValidationResult, GENERIC_ERROR_MESSAGE);
	// 	}
	// } catch (error) {
	// 	console.error(`${event.route.id}`, error);
	// 	return message(formValidationResult, GENERIC_ERROR_MESSAGE);
	// }
};
export const actions: Actions = { locationUpdate };
