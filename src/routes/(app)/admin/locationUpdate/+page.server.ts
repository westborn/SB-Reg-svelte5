import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

import { getExhibits, type Exhibit, upsertEntryLocation } from '$lib/components/server/registrationDB';
import { locationSchemaUI } from '$lib/zod-schemas';
import { EXHIBITION_YEAR, GENERIC_ERROR_MESSAGE, GENERIC_ERROR_UNEXPECTED } from '$lib/constants';
import { logger } from '$lib/server/logger';
import type { Actions, PageServerLoad, RequestEvent } from '../$types';
import { message, superValidate } from 'sveltekit-superforms';

export const load: PageServerLoad = async (event) => {
	const { user } = await event.locals.V1safeGetSession();
	try {
		const exhibits = await getExhibits({ rows: 999, offset: 0, entryYear: EXHIBITION_YEAR });
		return {
			exhibits: exhibits.sort(
				(a, b) => (a.exhibitNumber || '999').localeCompare(b.exhibitNumber || '999') || a.entryId - b.entryId
			),
			locationForm: await superValidate(zod4(locationSchemaUI))
		};

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		await logger.error('Failed to load exhibits for location update', error, {
			userId: user?.id,
			userEmail: user?.email,
			routeId: '/admin/locationUpdate',
			...(user?.isSuperAdmin && {
				adminAction: true,
				adminEmail: user.email
			})
		});
		return { error: error.message };
	}
};

const locationUpdate = async (event: RequestEvent) => {
	const newlocationSchemaUI = locationSchemaUI.extend({ entryId: z.number() });
	const formValidationResult = await superValidate(event, zod4(newlocationSchemaUI));
	if (!formValidationResult.valid) {
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
		await upsertEntryLocation(entryId, formValidationResult.data.location);

		// Log successful location update
		await logger.info('Location updated successfully', {
			userId: user.id,
			entryId,
			exhibitNumber,
			userEmail: user.email,
			routeId: event.route.id,
			adminAction: true,
			adminEmail: user.email
		});
	} catch (error) {
		await logger.error('Location update failed', error as Error, {
			userId: user.id,
			entryId,
			exhibitNumber,
			userEmail: user.email,
			routeId: event.route.id,
			adminAction: true,
			adminEmail: user.email
		});
		return message(formValidationResult, GENERIC_ERROR_UNEXPECTED, {
			status: 400
		});
	}

	return message(formValidationResult, { newLocation: formValidationResult.data.location });
};
export const actions: Actions = { locationUpdate };
