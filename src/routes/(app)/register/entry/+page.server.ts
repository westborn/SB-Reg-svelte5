import type { Actions, PageServerLoad } from './$types';
import type { RequestEvent } from './$types';

import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { fail, message, superValidate, withFiles } from 'sveltekit-superforms';
import { prisma } from '$lib/components/server/prisma';

import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_UNEXPECTED } from '$lib/constants';
import { entryDeleteSchemaUI, entrySchemaUI, fileUploadSchema } from '$lib/zod-schemas';
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
	return;
};

const entryUpdate = async (event: RequestEvent) => {
	const updateImagesSchema = entrySchemaUI.extend({
		images: z.string().nullable(),
		primaryImageId: z.number().nullable(),
		idToUpdate: z.number()
	});
	const formValidationResult = await superValidate(event, zod4(updateImagesSchema));

	if (!formValidationResult.valid) {
		return message(formValidationResult, 'Registration is Invalid - please reload and try again, or, call us!!', {
			status: 400
		});
	}
	const { user } = await event.locals.V1safeGetSession();

	// extract the images data and entry id that we need to update
	let workingImages: CurrentImage[] = [];
	let primaryImageId: number | null = null;
	let idToUpdate = null;

	try {
		if (formValidationResult.data.images) {
			workingImages = JSON.parse(formValidationResult.data.images);
		}
		primaryImageId = formValidationResult.data.primaryImageId;

		if (!formValidationResult.data.idToUpdate) {
			return message(formValidationResult, 'No entry ID provided for update - aborting update.', { status: 400 });
		}
		idToUpdate = formValidationResult.data.idToUpdate;
	} catch (error) {
		return message(formValidationResult, 'Error processing update data.', { status: 400 });
	}

	// Get the submission from the database
	try {
		const submissionFromDB = await getSubmission(user as User);
		if (!submissionFromDB) {
			return message(formValidationResult, GENERIC_ERROR_MESSAGE);
		}

		const entryFromDB = submissionFromDB.registrations[0].entries.find((entry) => entry.id === idToUpdate);
		if (!entryFromDB) {
			return message(formValidationResult, GENERIC_ERROR_MESSAGE);
		}

		// Get the existing images from the database
		const existingImages = entryFromDB.images || [];

		// Wrap entire update operation in a transaction for data consistency
		await prisma.$transaction(async (tx) => {
			// Handle image updates if there are working images
			if (workingImages && workingImages.length > 0) {
				// Get working image IDs (filter out null images and null IDs)
				const workingImageIds = workingImages.filter((img) => img && img.id).map((img) => img!.id);
				const existingImageIds = existingImages.map((img) => img.id);

				// Find images to remove (existing but not in working images)
				const imagesToRemove = existingImages.filter((img) => !workingImageIds.includes(img.id));

				// Find images to add (working but not in existing, and have valid IDs)
				const imagesToAdd = workingImages.filter((img) => img && img.id && !existingImageIds.includes(img.id));

				// Remove images that are no longer needed
				for (const imageToRemove of imagesToRemove) {
					try {
						await deleteImage(imageToRemove.id, entryFromDB.id);
					} catch (error) {
						// Silent fail for image removal
					}
				}

				// Add new images to the entry
				for (const imageToAdd of imagesToAdd) {
					if (imageToAdd && imageToAdd.id) {
						try {
							await tx.imageTable.update({
								where: { id: imageToAdd.id },
								data: {
									registrationId: entryFromDB.registrationId,
									entryId: entryFromDB.id
								}
							});
						} catch (error) {
							// Silent fail for image addition
						}
					}
				}

				// Update primary image relationship if specified
				if (primaryImageId && workingImageIds.includes(primaryImageId)) {
					try {
						await setPrimaryImage(entryFromDB.id, primaryImageId);
					} catch (error) {
						return message(formValidationResult, 'Error setting primary image');
					}
				}
			}

			const { title, price, inOrOut, material, specialRequirements, description, dimHeight, dimLength, dimWidth } =
				formValidationResult.data;
			// put the dimensions into a single string with 'x' separator
			const dimensions = [dimLength, dimWidth, dimHeight].filter((dim) => dim).join('x') || '';

			const updatedEntry = await tx.entryTable.update({
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
				return message(formValidationResult, GENERIC_ERROR_MESSAGE);
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

const entryCreate = async (event: RequestEvent) => {
	const newImagesSchema = entrySchemaUI.extend({
		images: z.string().nullable(),
		primaryImageId: z.number().nullable()
	});
	const formValidationResult = await superValidate(event, zod4(newImagesSchema));

	if (!formValidationResult.valid) {
		return message(formValidationResult, 'Entry is Invalid - please reload and try again, or, call us!!', {
			status: 400
		});
	}
	const { user } = await event.locals.V1safeGetSession();

	// Process images data if available
	let workingImages: CurrentImage[] = [];
	let primaryImageId: number | null = null;

	try {
		if (formValidationResult.data.images) {
			workingImages = JSON.parse(formValidationResult.data.images);
		}
		primaryImageId = formValidationResult.data.primaryImageId;
	} catch (error) {
		return message(formValidationResult, 'Error processing images data.', { status: 400 });
	}

	let artistId: number;
	let registrationId: number;

	// Get the submission from the database and make sure we have a registration to attach the entry to
	try {
		const submissionFromDB = await getSubmission(user as User);
		if (!submissionFromDB) {
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
			return message(formValidationResult, GENERIC_ERROR_MESSAGE);
		}
	} catch (error) {
		return message(formValidationResult, GENERIC_ERROR_UNEXPECTED);
	}

	// If images were provided, update the images with the new entry details and set primary in transaction
	if (workingImages && workingImages.length > 0) {
		await prisma.$transaction(async (tx) => {
			// Update all working images to link to the new entry
			for (const workingImage of workingImages) {
				if (workingImage && workingImage.id) {
					try {
						await tx.imageTable.update({
							where: { id: workingImage.id },
							data: {
								registrationId,
								entryId: newEntry.id
							}
						});
					} catch (error) {
						// Silent fail for image linking
					}
				}
			}

			// Set the primary image if specified, otherwise use the first image
			const imageIdToSetAsPrimary = primaryImageId || workingImages[0]?.id;
			if (imageIdToSetAsPrimary) {
				try {
					await createPrimaryImageRelation(newEntry.id, imageIdToSetAsPrimary);
				} catch (error) {
					return message(formValidationResult, 'Error setting primary image');
				}
			}
		});
	}

	// Return the updated submission
	const updatedSubmission = await getSubmission(user as User);
	const returnData = { formValidationResult, updatedSubmission };
	return returnData;
};

const imageUpload = async (event: RequestEvent) => {
	const formValidationResult = await superValidate(event, zod4(fileUploadSchema));
	if (!formValidationResult.valid) {
		return fail(400, withFiles({ formValidationResult }));
	}

	// Get the submission from the database and make sure we have a registration to attach the entry to
	const { user } = await event.locals.V1safeGetSession();
	try {
		const submissionFromDB = await getSubmission(user as User);
		if (!submissionFromDB) {
			return message(formValidationResult, GENERIC_ERROR_MESSAGE);
		}

		// Attempt to upload the image to Cloudinary
		const uploadResult = await uploadImageToCloudinary(formValidationResult.data.image, 'UnAttachedImages');
		if (!uploadResult.success) {
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

		const returnData = { formValidationResult, newImage };
		return withFiles(returnData);
	} catch (error) {
		return fail(500, withFiles({ formValidationResult }));
	}
};

const entryDelete = async (event: RequestEvent) => {
	const formValidationResult = await superValidate(event, zod4(entryDeleteSchemaUI));
	if (!formValidationResult.valid) {
		return fail(400, formValidationResult);
	}

	const idAsString = event.url.searchParams.get('id');
	if (!idAsString) {
		return message(formValidationResult, 'No ID provided for delete - aborting delete.', { status: 400 });
	}
	const idToDelete = parseInt(idAsString);

	const { user } = await event.locals.V1safeGetSession();
	try {
		const submissionFromDB = await getSubmission(user as User);
		if (!submissionFromDB) {
			return message(formValidationResult, GENERIC_ERROR_MESSAGE);
		}

		const entryFromDB = submissionFromDB.registrations[0].entries.find((entry) => entry.id === idToDelete);
		if (!entryFromDB) {
			return message(formValidationResult, GENERIC_ERROR_MESSAGE);
		}

		const deletedEntry = await prisma.entryTable.delete({ where: { id: idToDelete } });
		if (!deletedEntry) {
			return message(formValidationResult, GENERIC_ERROR_MESSAGE);
		}
	} catch (error) {
		return fail(500, withFiles({ formValidationResult }));
	}
	// Return the updated submission
	const updatedSubmission = await getSubmission(user as User);
	const returnData = { formValidationResult, updatedSubmission };
	return returnData;
};

const setPrimaryImageAction = async (event: RequestEvent) => {
	const setPrimaryImageSchema = z.object({
		entryId: z.number().int(),
		imageId: z.number().int()
	});

	const formValidationResult = await superValidate(event, zod4(setPrimaryImageSchema));

	if (!formValidationResult.valid) {
		return message(formValidationResult, 'Invalid data for setting primary image', { status: 400 });
	}

	const { user } = await event.locals.V1safeGetSession();
	const { entryId, imageId } = formValidationResult.data;

	try {
		await setPrimaryImage(entryId, imageId);
	} catch (error) {
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

	const formValidationResult = await superValidate(event, zod4(imageDeleteSchema));

	if (!formValidationResult.valid) {
		return message(formValidationResult, 'Invalid data for deleting image', { status: 400 });
	}

	const { user } = await event.locals.V1safeGetSession();
	const { imageId, entryId } = formValidationResult.data;

	try {
		const result = await deleteImage(imageId, entryId);
	} catch (error) {
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
