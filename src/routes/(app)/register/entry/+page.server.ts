import type { Actions, PageServerLoad } from './$types';
import type { RequestEvent } from './$types';

import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { redirect } from '@sveltejs/kit';
import { fail, message, superValidate, withFiles } from 'sveltekit-superforms';
import { prisma } from '$lib/components/server/prisma';

import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_UNEXPECTED, SUCCESS_MESSAGE } from '$lib/constants';
import { entrySchemaUI, fileUploadSchema } from '$lib/zod-schemas';
import {
	createImage,
	createNewRegistration,
	getSubmission,
	type CurrentImage
} from '$lib/components/server/registrationDB';
import { uploadImageToCloudinary } from '$lib/components/server/cloudinary';

export const load: PageServerLoad = async (event) => {
	const { session, user } = await event.locals.V1safeGetSession();
	if (!user || !session) redirect(302, '/login');
	console.log(`${event.route.id} - LOAD - START`);
	return;
};

const updateEntry = async (event: RequestEvent) => {
	const form = await superValidate(event, zod(entrySchemaUI));
	if (!form.valid) {
		return message(form, 'Registration is Invalid - please reload and try again, or, call us!!', { status: 400 });
	}
	const { session, user } = await event.locals.V1safeGetSession();
	if (!user || !session) return redirect(302, '/login');

	try {
		// TODO validate the correct entry before updating....
		const result = await prisma.entryTable.update({
			where: { id: 1 },
			data: {}
		});

		if (!result) {
			console.error(`${event.route.id} - ${GENERIC_ERROR_MESSAGE}`);
			return message(form, GENERIC_ERROR_MESSAGE);
		}
	} catch (error) {
		console.error(`${event.route.id}`, error);
		return message(form, GENERIC_ERROR_MESSAGE);
	}

	return message(form, SUCCESS_MESSAGE);
};
const createEntry = async (event: RequestEvent) => {
	const newImageSchema = entrySchemaUI.extend({ image: z.string().nullable() });
	const formValidationResult = await superValidate(event, zod(newImageSchema));

	if (!formValidationResult.valid) {
		return message(formValidationResult, 'Entry is Invalid - please reload and try again, or, call us!!', {
			status: 400
		});
	}
	const { session, user } = await event.locals.V1safeGetSession();
	if (!user || !session) return redirect(302, '/login');
	// Process image data if available
	let workingImage = null;
	try {
		if (formValidationResult.data.image) {
			workingImage = JSON.parse(formValidationResult.data.image);
		}
	} catch (error) {
		console.error('Error parsing image data:', error);
		return message(formValidationResult, 'Error processing image data.', { status: 400 });
	}

	const artistEmail = user.email; // TODO Ensure email is correctly identified
	let artistId: number;
	let registrationId: number;

	// Get the submission from the database and make sure we have a registration to attach the entry to
	try {
		const submissionFromDB = await getSubmission(artistEmail);
		if (!submissionFromDB) {
			console.error(`${event.route.id} - ${GENERIC_ERROR_MESSAGE}`);
			return message(formValidationResult, GENERIC_ERROR_MESSAGE);
		}

		// if this is the first entry create a new registration
		const [firstRegistration] = submissionFromDB.registrations;
		if (submissionFromDB.registrations.length === 0) {
			const newRegistration = await createNewRegistration(submissionFromDB.id);
			artistId = newRegistration.artistId;
			registrationId = newRegistration.id;
		} else {
			artistId = firstRegistration.artistId;
			registrationId = firstRegistration.id;
		}
	} catch (error) {
		console.error(`${event.route.id} - `, error);
		return message(formValidationResult, GENERIC_ERROR_UNEXPECTED);
	}

	// Create the entry
	const {
		title,
		price,
		inOrOut,
		material,
		specialRequirements,
		enterMajorPrize,
		description,
		dimHeight,
		dimLength,
		dimWidth
	} = formValidationResult.data;

	let newEntry;
	try {
		newEntry = await prisma.entryTable.create({
			data: {
				artistId,
				registrationId,
				accepted: false,
				title: title ?? '',
				inOrOut: inOrOut === 'Outdoor' ? 'Outdoor' : 'Indoor',
				material: material ?? '',
				description: description ?? '',
				specialRequirements: specialRequirements ?? '',
				enterMajorPrize: enterMajorPrize === 'Yes' ? true : false,
				dimensions: `${dimLength ?? '0'}x${dimWidth ?? '0'}x${dimHeight ?? '0'}`,
				price: price * 100
			}
		});
		if (!newEntry) {
			console.error(`${event.route.id} - ${GENERIC_ERROR_MESSAGE}`);
			return message(formValidationResult, GENERIC_ERROR_MESSAGE);
		}
	} catch (error) {
		console.error(`${event.route.id} - `, error);
		return message(formValidationResult, GENERIC_ERROR_UNEXPECTED);
	}

	// If an image was provided, update the image with the new entry details
	if (workingImage) {
		const updatedImage = await prisma.imageTable.update({
			where: { id: workingImage.id },
			data: {
				registrationId,
				entryId: newEntry.id
			}
		});
		//TODO Update image tag to be attached
		// cloudinary.v2.uploader.explicit(public_id, options).then(callback);
	}

	// Return the updated submission
	const updatedSubmission = await getSubmission(artistEmail);
	const returnData = { formValidationResult, updatedSubmission };
	return returnData;
};

const uploadImage = async (event: RequestEvent) => {
	console.log(`${event.route.id} - uploadImage - ACTION`);
	const formValidationResult = await superValidate(event, zod(fileUploadSchema));
	if (!formValidationResult.valid) {
		return fail(400, withFiles({ formValidationResult }));
	}
	try {
		// Attempt to upload the image to Cloudinary
		const uploadResult = await uploadImageToCloudinary(formValidationResult.data.image, 'UnAttachedImages');
		if (!uploadResult.success) {
			console.error('Error uploading image to Cloudinary:', uploadResult);
			return fail(500, withFiles({ formValidationResult }));
		}
		// Extract Cloudinary URL and ID from the successful upload result
		const { public_id: cloudId, secure_url: cloudURL } = uploadResult.result;

		// save to database, return success response with image URL, etc.
		const newImage = await createImage({
			id: 0,
			artistId: 1,
			cloudId,
			cloudURL,
			originalFileName: formValidationResult.data.image.name
		} as CurrentImage);

		//TODO update tag when image is attached to an entry
		// cloudinary.v2.uploader.replace_tag(tag, public_ids, options, callback);
		const returnData = { formValidationResult, newImage };
		return withFiles(returnData);
	} catch (error) {
		console.error(`${event.route.id} - Error during image upload:`, error);
		return fail(500, withFiles({ formValidationResult }));
	}
};

export const actions: Actions = { updateEntry, createEntry, uploadImage };
