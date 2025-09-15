import type { Actions, PageServerLoad } from './$types';
import type { RequestEvent } from './$types';

import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { fail, message, superValidate, withFiles } from 'sveltekit-superforms';
import { prisma } from '$lib/components/server/prisma';

import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_UNEXPECTED } from '$lib/constants';
import { entryDeleteSchemaUI, entrySchemaUI, fileUploadSchema, multipleImagesSchema } from '$lib/zod-schemas';
import {
	createImage,
	createNewRegistration,
	getSubmission,
	createPrimaryImageRelation,
	setPrimaryImage,
	deleteImage,
	type CurrentImage,
	type User
} from '$lib/components/server/registrationDB';
import { uploadImageToCloudinary } from '$lib/components/server/cloudinary';

export const load: PageServerLoad = async (event) => {
	//console.log(`${event.route.id} - LOAD - START`);
	return;
};

const entryUpdate = async (event: RequestEvent) => {
	const updateImageSchema = entrySchemaUI.extend({ image: z.string().nullable(), idToUpdate: z.number() });
	const formValidationResult = await superValidate(event, zod(updateImageSchema));

	if (!formValidationResult.valid) {
		return message(formValidationResult, 'Registration is Invalid - please reload and try again, or, call us!!', {
			status: 400
		});
	}
	const { user } = await event.locals.V1safeGetSession();
	// extract the image data and entry id that we need to update
	let workingImage = null;
	let idToUpdate = null;
	try {
		if (formValidationResult.data.image) {
			workingImage = JSON.parse(formValidationResult.data.image);
		}
		if (!formValidationResult.data.idToUpdate) {
			console.error('No entry ID provided for update - aborting update.');
			return message(formValidationResult, 'No entry ID provided for update - aborting update.', { status: 400 });
		}
		idToUpdate = formValidationResult.data.idToUpdate;
	} catch (error) {
		console.error('Error parsing update data:', error);
		return message(formValidationResult, 'Error processing update data.', { status: 400 });
	}

	console.log('About to update entry with ID:', idToUpdate);
	// Get the submission from the database
	try {
		const submissionFromDB = await getSubmission(user as User);
		if (!submissionFromDB) {
			console.error(`${event.route.id} - Getting DB Submission${GENERIC_ERROR_MESSAGE}`);
			return message(formValidationResult, GENERIC_ERROR_MESSAGE);
		}

		const entryFromDB = submissionFromDB.registrations[0].entries.find((entry) => entry.id === idToUpdate);
		if (!entryFromDB) {
			console.error(`${event.route.id} - Getting DB Entry${GENERIC_ERROR_MESSAGE}`);
			return message(formValidationResult, GENERIC_ERROR_MESSAGE);
		}

		// Get the image from the database if there is one
		const imageFromDB = entryFromDB.images.find((image) => image.entryId === idToUpdate);

		//check if the user is trying to update the image (the cloudinary id will have changed)
		if (workingImage && workingImage.cloudId !== imageFromDB?.cloudId) {
			// update the DB image to link to this entry
			console.log('Updating image with new entry details');
			const updatedImage = await prisma.imageTable.update({
				where: { id: workingImage.id },
				data: {
					registrationId: entryFromDB.registrationId,
					entryId: entryFromDB.id
				}
			});
			if (!updatedImage) {
				console.error(`${event.route.id} - Updating DB Image${GENERIC_ERROR_MESSAGE}`);
				return message(formValidationResult, GENERIC_ERROR_MESSAGE);
			}
			if (imageFromDB) {
				//delete the old image from the database
				const deletedImage = await prisma.imageTable.delete({ where: { id: imageFromDB.id } });
				if (!deletedImage) {
					console.error(`${event.route.id} - Deleting Old DB Image${GENERIC_ERROR_MESSAGE}`);
					return message(formValidationResult, GENERIC_ERROR_MESSAGE);
				}
			}

			// Set the new image as primary (will create or update primary image relation)
			try {
				await setPrimaryImage(entryFromDB.id, updatedImage.id);
			} catch (error) {
				console.error(`${event.route.id} - Error setting primary image:`, error);
				return message(formValidationResult, 'Error setting primary image');
			}

			//TODO Update image tag to be attached
			// cloudinary.v2.uploader.explicit(public_id, options).then(callback);
		}

		const { title, price, inOrOut, material, specialRequirements, description, dimHeight, dimLength, dimWidth } =
			formValidationResult.data;
		// put the dimensions into a single string with 'x' separator
		const dimensions = [dimLength, dimWidth, dimHeight].filter((dim) => dim).join('x') || '';

		const updatedEntry = await prisma.entryTable.update({
			where: { id: idToUpdate },
			data: {
				title: title ?? '',
				inOrOut: inOrOut === 'Outdoor' ? 'Outdoor' : 'Indoor',
				material: material ?? '',
				description: description ?? '',
				specialRequirements: specialRequirements ?? '',
				dimensions,
				price: (price ?? 0) * 100
			}
		});

		if (!updatedEntry) {
			console.error(`${event.route.id} - ${GENERIC_ERROR_MESSAGE}`);
			return message(formValidationResult, GENERIC_ERROR_MESSAGE);
		}
		console.log('Entry updated successfully', updatedEntry);
	} catch (error) {
		console.error(`${event.route.id}`, error);
		return message(formValidationResult, GENERIC_ERROR_MESSAGE);
	}

	// Return the updated submission
	const updatedSubmission = await getSubmission(user as User);
	const returnData = { formValidationResult, updatedSubmission };
	return returnData;
};

const entryCreate = async (event: RequestEvent) => {
	const newImageSchema = entrySchemaUI.extend({ image: z.string().nullable() });
	const formValidationResult = await superValidate(event, zod(newImageSchema));

	if (!formValidationResult.valid) {
		return message(formValidationResult, 'Entry is Invalid - please reload and try again, or, call us!!', {
			status: 400
		});
	}
	const { user } = await event.locals.V1safeGetSession();
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

	let artistId: number;
	let registrationId: number;

	// Get the submission from the database and make sure we have a registration to attach the entry to
	try {
		const submissionFromDB = await getSubmission(user as User);
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
	const { title, price, inOrOut, material, specialRequirements, description, dimHeight, dimLength, dimWidth } =
		formValidationResult.data;

	// put the dimensions into a single string with 'x' separator
	const dimensions = [dimLength, dimWidth, dimHeight].filter((dim) => dim).join('x') || '';

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
				enterMajorPrize: true,
				dimensions,
				price: (price ?? 0) * 100
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

	// If an image was provided, update the image with the new entry details and set as primary
	if (workingImage) {
		const updatedImage = await prisma.imageTable.update({
			where: { id: workingImage.id },
			data: {
				registrationId,
				entryId: newEntry.id
			}
		});
		if (!updatedImage) {
			console.error(`${event.route.id} - Updating DB Image${GENERIC_ERROR_MESSAGE}`);
			return message(formValidationResult, GENERIC_ERROR_MESSAGE);
		}

		// Set this image as the primary image for the entry
		try {
			await createPrimaryImageRelation(newEntry.id, updatedImage.id);
		} catch (error) {
			console.error(`${event.route.id} - Error creating primary image relation:`, error);
			return message(formValidationResult, 'Error setting primary image');
		}

		//TODO Update image tag to be attached
		// cloudinary.v2.uploader.explicit(public_id, options).then(callback);
	}

	// Return the updated submission
	const updatedSubmission = await getSubmission(user as User);
	const returnData = { formValidationResult, updatedSubmission };
	return returnData;
};

const imageUpload = async (event: RequestEvent) => {
	//console.log(`${event.route.id} - imageUpload - ACTION`);

	const formValidationResult = await superValidate(event, zod(fileUploadSchema));
	if (!formValidationResult.valid) {
		return fail(400, withFiles({ formValidationResult }));
	}

	// Get the submission from the database and make sure we have a registration to attach the entry to
	const { user } = await event.locals.V1safeGetSession();
	try {
		const submissionFromDB = await getSubmission(user as User);
		if (!submissionFromDB) {
			console.error(`${event.route.id} - ${GENERIC_ERROR_MESSAGE}`);
			return message(formValidationResult, GENERIC_ERROR_MESSAGE);
		}

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
			artistId: submissionFromDB.id,
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

const entryDelete = async (event: RequestEvent) => {
	//console.log(`${event.route.id} - entryDelete - ACTION`);

	const formValidationResult = await superValidate(event, zod(entryDeleteSchemaUI));
	if (!formValidationResult.valid) {
		return fail(400, formValidationResult);
	}

	const idAsString = event.url.searchParams.get('id');
	if (!idAsString) {
		console.error('No ID provided for delete - aborting delete.');
		return message(formValidationResult, 'No ID provided for delete - aborting delete.', { status: 400 });
	}
	const idToDelete = parseInt(idAsString);
	console.log('Deleting entry with id:', idToDelete);

	const { user } = await event.locals.V1safeGetSession();
	try {
		const submissionFromDB = await getSubmission(user as User);
		if (!submissionFromDB) {
			console.error(`${event.route.id} - Getting DB Submission${GENERIC_ERROR_MESSAGE}`);
			return message(formValidationResult, GENERIC_ERROR_MESSAGE);
		}

		const entryFromDB = submissionFromDB.registrations[0].entries.find((entry) => entry.id === idToDelete);
		if (!entryFromDB) {
			console.error(`${event.route.id} - Finding entry to delete${GENERIC_ERROR_MESSAGE}`);
			return message(formValidationResult, GENERIC_ERROR_MESSAGE);
		}

		const deletedEntry = await prisma.entryTable.delete({ where: { id: idToDelete } });
		if (!deletedEntry) {
			console.error(`${event.route.id} - Deleting DB Entry${GENERIC_ERROR_MESSAGE}`);
			return message(formValidationResult, GENERIC_ERROR_MESSAGE);
		}
	} catch (error) {
		console.error(`${event.route.id} - Error during entry delete:`, error);
		return fail(500, withFiles({ formValidationResult }));
	}
	// Return the updated submission
	console.log('completed entry delete');
	const updatedSubmission = await getSubmission(user as User);
	const returnData = { formValidationResult, updatedSubmission };
	return returnData;
};

const setPrimaryImageAction = async (event: RequestEvent) => {
	const setPrimaryImageSchema = z.object({
		entryId: z.number().int(),
		imageId: z.number().int()
	});

	const formValidationResult = await superValidate(event, zod(setPrimaryImageSchema));

	if (!formValidationResult.valid) {
		return message(formValidationResult, 'Invalid data for setting primary image', { status: 400 });
	}

	const { user } = await event.locals.V1safeGetSession();
	const { entryId, imageId } = formValidationResult.data;

	try {
		await setPrimaryImage(entryId, imageId);
	} catch (error) {
		console.error(`${event.route.id} - Error setting primary image:`, error);
		return message(formValidationResult, 'Error setting primary image');
	}

	// Return the updated submission
	const updatedSubmission = await getSubmission(user as User);
	const returnData = { formValidationResult, updatedSubmission };
	return returnData;
};

const imageDeleteAction = async (event: RequestEvent) => {
	const imageDeleteSchema = z.object({
		imageId: z.number().int(),
		entryId: z.number().int()
	});

	const formValidationResult = await superValidate(event, zod(imageDeleteSchema));

	if (!formValidationResult.valid) {
		return message(formValidationResult, 'Invalid data for deleting image', { status: 400 });
	}

	const { user } = await event.locals.V1safeGetSession();
	const { imageId, entryId } = formValidationResult.data;

	try {
		const result = await deleteImage(imageId, entryId);
		console.log('Image deleted successfully', result);
	} catch (error) {
		console.error(`${event.route.id} - Error deleting image:`, error);
		return message(formValidationResult, error instanceof Error ? error.message : 'Error deleting image');
	}

	// Return the updated submission
	const updatedSubmission = await getSubmission(user as User);
	const returnData = { formValidationResult, updatedSubmission };
	return returnData;
};

export const actions: Actions = {
	entryUpdate,
	entryCreate,
	entryDelete,
	imageUpload,
	setPrimaryImage: setPrimaryImageAction,
	imageDelete: imageDeleteAction
};
