import { superValidate } from 'sveltekit-superforms';
import type { LayoutServerLoad } from './$types';
import { zod4 } from 'sveltekit-superforms/adapters';
import {
	artistSchemaUI,
	entryDeleteSchemaUI,
	entrySchemaUI,
	confirmSchemaUI,
	fileUploadSchema
} from '$lib/zod-schemas';
import { getSubmission, type User } from '$lib/components/server/registrationDB';

export const load: LayoutServerLoad = async (event) => {
	// Get submission data to populate forms with existing values
	const { user } = await event.locals.V1safeGetSession();
	const submission = user ? await getSubmission(user as User) : null;

	// Prepare initial data for forms based on submission
	const artistData = submission
		? {
				firstName: submission.firstName,
				lastName: submission.lastName,
				phone: submission.phone,
				postcode: submission.postcode,
				firstNations: submission.firstNations,
				bankAccountName: submission.bankAccountName,
				bankBSB: submission.bankBSB,
				bankAccount: submission.bankAccount
			}
		: undefined;

	const confirmData =
		submission && submission.registrations.length > 0
			? {
					id: submission.registrations[0].id,
					artistId: submission.id,
					registrationYear: submission.registrations[0].registrationYear,
					closed: submission.registrations[0].closed ? 'Yes' : 'No',
					bumpIn: submission.registrations[0].bumpIn,
					bumpOut: submission.registrations[0].bumpOut,
					displayRequirements: submission.registrations[0].displayRequirements,
					crane: submission.registrations[0].crane ? 'Yes' : 'No',
					bankAccountName: submission.bankAccountName,
					bankBSB: submission.bankBSB,
					bankAccount: submission.bankAccount
				}
			: undefined;

	const [artistForm, entryForm, entryDeleteForm, confirmForm, imageUploadForm] = await Promise.all([
		superValidate(artistData, zod4(artistSchemaUI)),
		superValidate(zod4(entrySchemaUI)),
		superValidate(zod4(entryDeleteSchemaUI)),
		superValidate(confirmData, zod4(confirmSchemaUI)),
		superValidate(zod4(fileUploadSchema))
	]);

	return {
		cookies: event.cookies.getAll(),
		artistForm,
		entryForm,
		entryDeleteForm,
		confirmForm,
		imageUploadForm
	};
};
