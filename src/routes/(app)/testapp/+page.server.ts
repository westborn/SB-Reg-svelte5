import type { PageServerLoad, RequestEvent } from './$types';

import { superValidate, fail, withFiles } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fileUploadSchema } from '$lib/zod-schemas';
import { createImage, getImage, type CurrentImage } from '$lib/components/server/registrationDB';
import { redirect } from '@sveltejs/kit';

import { getCloudinaryURL, uploadImageToCloudinary } from '$lib/components/server/cloudinary.ts';

export const load: PageServerLoad = async (event) => {
	console.log(`${event.route.id} - LOAD - START`);
	const { session, user } = await event.locals.V1safeGetSession();
	if (!user) redirect(302, '/'); //already logged in so we have a valid email address in user

	// TODO pass in the corredct image id
	const currentImage = await getImage(4);
	return {
		session,
		user,
		form: await superValidate(zod(fileUploadSchema)),
		currentImage
	};
};

export const actions = {
	default: async (event: RequestEvent) => {
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

		console.log(result);
		console.log('cloudId:', cloudId);
		console.log('cloudURL:', cloudURL);
		console.log('originalFileName:', form.data.image.name);

		const image = await createImage({
			id: 0,
			artistId: 1,
			cloudId,
			cloudURL,
			originalFileName: form.data.image.name
		} as CurrentImage);

		//TODO update tag when image is attached to an entry
		// cloudinary.v2.uploader.replace_tag(tag, public_ids, options, callback);
		console.log('image:', image);
		return withFiles({ form, image });
	}
};
