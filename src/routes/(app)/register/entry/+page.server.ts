import type { Actions, PageServerLoad } from './$types';
import type { RequestEvent } from './$types';

import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { redirect } from '@sveltejs/kit';
import { fail, message, superValidate, withFiles } from 'sveltekit-superforms';
import { prisma } from '$lib/components/server/prisma';

import { ExhibitionYear, GENERIC_ERROR_MESSAGE, GENERIC_ERROR_UNEXPECTED, SUCCESS_MESSAGE } from '$lib/constants';
import { entrySchemaUI, fileUploadSchema } from '$lib/zod-schemas';
import { createImage, getEntries, type CurrentImage } from '$lib/components/server/registrationDB';
import { uploadImageToCloudinary } from '$lib/components/server/cloudinary';

async function fetchEntries(userEmail: string) {
	const result = await getEntries(userEmail);
	if (!result) {
		console.log('No Artist Found');
		return [];
	}
	if (!result.registrations) {
		console.log('No Registration Found');
		return [];
	}
	if (result.registrations.length === 0) {
		console.log('No Entries Found');
		return [];
	}
	console.log(`Entries Found - ${result.registrations[0].entries.length}`);
	return result.registrations[0].entries;
}

export const load: PageServerLoad = async (event) => {
	const { session, user } = await event.locals.V1safeGetSession();
	if (!user || !session) redirect(302, '/login');
	console.log(`${event.route.id} - LOAD - START`);

	const entryForm = await superValidate(zod(entrySchemaUI));
	const imageUploadForm = await superValidate(zod(fileUploadSchema));
	const entries = await fetchEntries(user.email);
	return { entries, entryForm, imageUploadForm };
};

const updateEntry = async (event: RequestEvent) => {
	const form = await superValidate(event, zod(entrySchemaUI));
	if (!form.valid) {
		return message(form, 'Registration is Invalid - please reload and try again, or, call us!!', { status: 400 });
	}
	const { session, user } = await event.locals.V1safeGetSession();
	if (!user || !session) return redirect(302, '/login');

	try {
		const entryEmail = user.email; // TODO Assuming email is the correct identifier
		console.log('updateEntry', entryEmail);
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
	const form = await superValidate(event, zod(newImageSchema));

	console.log('createEntry', form);
	if (!form.valid) {
		return message(form, 'Entry is Invalid - please reload and try again, or, call us!!', { status: 400 });
	}
	const { session, user } = await event.locals.V1safeGetSession();
	if (!user || !session) return redirect(302, '/login');
	// Process image data if available
	let workingImage = null;
	try {
		if (form.data.image) {
			workingImage = JSON.parse(form.data.image);
			console.log('workingImage', workingImage);
		}
	} catch (error) {
		console.error('Error parsing image data:', error);
		return message(form, 'Error processing image data.', { status: 400 });
	}
	// workingImage {
	// 	id: 58,
	// 	artistId: 1,
	// 	registrationId: null,
	// 	entryId: null,
	// 	cloudId: 'wciz3du4iowgrudhwden',
	// 	cloudURL: 'https://res.cloudinary.com/dpkmx9mow/image/upload/wciz3du4iowgrudhwden?_a=BAMADKRg0',
	// 	originalFileName: 'Arena Carpark.JPG'
	// }

	// get the registration id and the artist id from the registration table by using the artist email

	const artistEmail = user.email; // TODO Ensure email is correctly identified
	const registration = await prisma.artistTable.findUnique({
		where: {
			email: artistEmail
		},
		select: {
			registrations: {
				where: { registrationYear: ExhibitionYear.toString() },
				select: {
					artistId: true,
					id: true
				}
			}
		}
	});

	if (!registration) {
		console.log(`${event.route.id} - ${GENERIC_ERROR_MESSAGE}`);
		return message(form, GENERIC_ERROR_MESSAGE);
	}
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
	} = form.data;

	try {
		const result = await prisma.entryTable.create({
			data: {
				artistId: registration.registrations[0].artistId,
				registrationId: registration.registrations[0].id,
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
		if (!result) {
			console.error(`${event.route.id} - ${GENERIC_ERROR_MESSAGE}`);
			return message(form, GENERIC_ERROR_MESSAGE);
		}
	} catch (error) {
		console.error(`${event.route.id} - `, error);
		return message(form, GENERIC_ERROR_UNEXPECTED);
	}
	return message(form, SUCCESS_MESSAGE);
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
		console.log(`Image uploaded successfully to Cloudinary. ID: ${cloudId}, URL: ${cloudURL}`);
		// save to database, return success response with image URL, etc.
		const image = await createImage({
			id: 0,
			artistId: 1,
			cloudId,
			cloudURL,
			originalFileName: formValidationResult.data.image.name
		} as CurrentImage);
		//TODO update tag when image is attached to an entry
		// cloudinary.v2.uploader.replace_tag(tag, public_ids, options, callback);
		return withFiles({ formValidationResult, image });
	} catch (error) {
		console.error(`${event.route.id} - Error during image upload:`, error);
		return fail(500, withFiles({ formValidationResult }));
	}
};

export const actions: Actions = { updateEntry, createEntry, uploadImage };
