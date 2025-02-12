import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { prisma } from '$lib/components/server/prisma';

import { getExhibits, type Exhibit } from '$lib/components/server/registrationDB';
import { locationSchemaUI } from '$lib/zod-schemas';
import { EXHIBITION_YEAR, GENERIC_ERROR_MESSAGE, GENERIC_ERROR_UNEXPECTED } from '$lib/constants';
import type { Actions, PageServerLoad, RequestEvent } from '../$types';
import { message, superValidate } from 'sveltekit-superforms';

export const load: PageServerLoad = async () => {
	// console.log(`${event.route.id} - LOAD - START`);
	try {
		const exhibits = await getExhibits({ rows: 999, offset: 0, entryYear: EXHIBITION_YEAR });
		return {
			exhibits: exhibits.sort(
				(a, b) => (a.exhibitNumber || '999').localeCompare(b.exhibitNumber || '999') || a.entryId - b.entryId
			),
			locationForm: await superValidate(zod(locationSchemaUI))
		};

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.log('error: ', error.message);
		return { error: error.message };
	}
};

const locationUpdate = async (event: RequestEvent) => {
	const newlocationSchemaUI = locationSchemaUI.extend({ entryId: z.number() });
	const formValidationResult = await superValidate(event, zod(newlocationSchemaUI));
	if (!formValidationResult.valid) {
		console.log('locationUpdate - formValidationResult:', formValidationResult);
		return message(formValidationResult, 'Registration is Invalid - please reload and try again, or, call us!!', {
			status: 400
		});
	}

	// If the user is a superAdmin, they can update location
	const { user } = await event.locals.V1safeGetSession();
	if (!user.isSuperAdmin) {
		return message(formValidationResult, 'Must be SuperAdmin to update locations!!', {
			status: 400
		});
	}

	const entryId = formValidationResult.data.entryId;
	const exhibitNumber = formValidationResult.data.location;
	try {
		// Check if exhibitNumber already exists in exhibits
		const exhibits = await getExhibits({ rows: 999, offset: 0, entryYear: EXHIBITION_YEAR });
		if (exhibits.some((exhibit: Exhibit) => exhibit.exhibitNumber === exhibitNumber)) {
			return message(formValidationResult, 'This location is already assigned!!', {
				status: 400
			});
		}
		const upsertResult = await prisma.locationTable.upsert({
			where: { entryId: entryId },
			update: { exhibitNumber: formValidationResult.data.location },
			create: { entryId: formValidationResult.data.entryId, exhibitNumber: formValidationResult.data.location }
		});

		if (!upsertResult) {
			console.error(`${event.route.id} - ${GENERIC_ERROR_MESSAGE}`);
			return message(formValidationResult, GENERIC_ERROR_MESSAGE, {
				status: 400
			});
		}
	} catch (error) {
		console.error(`${event.route.id}`, error);
		return message(formValidationResult, GENERIC_ERROR_UNEXPECTED, {
			status: 400
		});
	}

	return message(formValidationResult, { newLocation: formValidationResult.data.location });
};
export const actions: Actions = { locationUpdate };
