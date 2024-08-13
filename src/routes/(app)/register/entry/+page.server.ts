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
import { getCloudinaryURL, uploadImageToCloudinary } from '$lib/components/server/cloudinary';

export const load: PageServerLoad = async (event) => {
	const { session, user } = await event.locals.V1safeGetSession();
	if (!user || !session) redirect(302, '/login');
	console.log(`${event.route.id} - LOAD - START`);

	const entryForm = await superValidate(zod(entrySchemaUI));
	const imageUploadForm = await superValidate(zod(fileUploadSchema));

	const artistEmail = user.email; // TODO Ensure email is correctly identified
	const result = await getEntries(artistEmail);
	if (!result) {
		console.log('No Artist Found');
	} else if (result && !result.registrations) {
		console.log('No Registration Found');
	} else if (result && result.registrations.length === 0) {
		console.log('No Entries Found');
	} else {
		console.log(`Entries Found - ${result.registrations[0].entries.length}`);
	}

	const entries = result?.registrations.length ? result.registrations[0].entries : [];
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
			console.log(`${event.route.id} - ${GENERIC_ERROR_MESSAGE}`);
			return message(form, GENERIC_ERROR_MESSAGE);
		}
	} catch (error) {
		console.log(`${event.route.id}`, error);
		return message(form, GENERIC_ERROR_MESSAGE);
	}

	return message(form, SUCCESS_MESSAGE);
};
const createEntry = async (event: RequestEvent) => {
	const newImageSchema = entrySchemaUI.extend({ image: z.string().nullable() });
	const form = await superValidate(event, zod(newImageSchema));

	console.log('createEntry', form);
	const workingImage = form.data.image ? JSON.parse(form.data.image) : null;
	console.log('workingImage', workingImage);

	// workingImage {
	// 	id: 58,
	// 	artistId: 1,
	// 	registrationId: null,
	// 	entryId: null,
	// 	cloudId: 'wciz3du4iowgrudhwden',
	// 	cloudURL: 'https://res.cloudinary.com/dpkmx9mow/image/upload/wciz3du4iowgrudhwden?_a=BAMADKRg0',
	// 	originalFileName: 'Arena Carpark.JPG'
	// }

	if (!form.valid) {
		return message(form, 'Entry is Invalid - please reload and try again, or, call us!!', { status: 400 });
	}
	const { session, user } = await event.locals.V1safeGetSession();
	if (!user || !session) return redirect(302, '/login');

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
			console.log(`${event.route.id} - ${GENERIC_ERROR_MESSAGE}`);
			return message(form, GENERIC_ERROR_MESSAGE);
		}
	} catch (error) {
		console.log(`${event.route.id} - `, error);
		return message(form, GENERIC_ERROR_UNEXPECTED);
	}

	return message(form, SUCCESS_MESSAGE);
};

const uploadImage = async (event: RequestEvent) => {
	console.log(`${event.route.id} - default - ACTION`);
	const form = await superValidate(event, zod(fileUploadSchema));
	if (!form.valid) {
		return fail(400, withFiles({ form }));
	}
	// Upload the inmage to cloudinary as an unattached image
	const result = await uploadImageToCloudinary(form.data.image, 'UnAttachedImages');
	if (!result.success) {
		console.log('Error uploading image to cloudinary');
		console.error(result);
		return fail(500, withFiles({ form }));
	}
	const cloudId = result.result.public_id;
	const cloudURL = getCloudinaryURL(cloudId);

	const image = await createImage({
		id: 0,
		artistId: 1,
		cloudId,
		cloudURL,
		originalFileName: form.data.image.name
	} as CurrentImage);

	//TODO update tag when image is attached to an entry
	// cloudinary.v2.uploader.replace_tag(tag, public_ids, options, callback);
	return withFiles({ form, image });
};

export const actions: Actions = { updateEntry, createEntry, uploadImage };
