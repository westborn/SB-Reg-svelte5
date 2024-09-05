import type { PageServerLoad, RequestEvent } from './$types';

import { superValidate, fail, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { v2 as cloudinary, type UploadApiErrorResponse, type UploadApiResponse } from 'cloudinary';
import { fileUploadSchema } from '$lib/zod-schemas';
import { createImage, getImage, type CurrentImage } from '$lib/components/server/registrationDB';
import { redirect } from '@sveltejs/kit';

import { cloudinaryConfig } from '$lib/components/server/cloudinary.ts';
cloudinary.config(cloudinaryConfig);

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
			return fail(400, { form });
		}

		// https://dev.to/emmabase/image-upload-to-cloudinary-using-nodejs-typescript-4oje
		const arrayBuffer = await form.data.image.arrayBuffer();
		const buffer = new Uint8Array(arrayBuffer);
		const uploadStream = await new Promise((resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{ upload_preset: 'UnAttachedImages' },
					function (err: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) {
						if (err) {
							console.error(err);
							return reject(err);
						}
						return resolve(result);
					}
				)
				.end(buffer);
		});
		const { public_id: cloudId } = uploadStream as UploadApiResponse;
		const cloudURL = cloudinary.url(cloudId, { secure: true });

		console.log('cloudId:', cloudId);
		console.log('cloudURL:', cloudURL);
		console.log('originalFileName:', form.data.image.name);

		const workingImage = {
			id: 0,
			artistId: 1,
			cloudId,
			cloudURL,
			originalFileName: form.data.image.name
		} as CurrentImage;
		const image = await createImage(workingImage);

		//TODO update tag when image is attached to an entry
		// cloudinary.v2.uploader.replace_tag(tag, public_ids, options, callback);

		console.log('image:', image);
		return message(form, 'You have uploaded a valid file!');
	}
};
