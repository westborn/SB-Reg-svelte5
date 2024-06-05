// NOTE: Import fail from Superforms, not from @sveltejs/kit!
import { superValidate, fail, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { PageServerLoad } from '../$types';
import { v2 as cloudinary, type UploadApiErrorResponse, type UploadApiResponse } from 'cloudinary';
import { CLOUDINARY_API_SECRET, CLOUDINARY_API_KEY } from '$env/static/private';
import { PUBLIC_CLOUDINARY_CLOUD_NAME } from '$env/static/public';
import { createImage } from '$lib/components/server/artist';

cloudinary.config({
	cloud_name: PUBLIC_CLOUDINARY_CLOUD_NAME,
	api_key: CLOUDINARY_API_KEY,
	api_secret: CLOUDINARY_API_SECRET,
	secure: true
});

const fileSchema = z.object({
	image: z
		.instanceof(File, { message: 'Please upload a file.' })
		.refine((f) => f.size < 5 * 1024 * 1024, 'Max 5Mb upload size.')
});

export const load: PageServerLoad = async (event) => {
	const { session, user } = await event.locals.safeGetSession();
	// if (!user) redirect(302, '/'); //already logged in so we have a valid email address in user
	return {
		session,
		user,
		form: await superValidate(zod(fileSchema))
	};
};

const getURL = (imagePath: string) => {
	return cloudinary.url(imagePath, { secure: true });
};

export const actions = {
	default: async ({ request }) => {
		console.log('doing action');
		const form = await superValidate(request, zod(fileSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		// https://dev.to/emmabase/image-upload-to-cloudinary-using-nodejs-typescript-4oje
		// TODO: Do something with the image
		// console.log(form.data.image.name, form.data.image.size, form.data.image.type);
		const arrayBuffer = await form.data.image.arrayBuffer();
		const buffer = new Uint8Array(arrayBuffer);
		const uploadStream = await new Promise((resolve, reject) => {
			cloudinary.uploader
				.upload_stream({}, function (err: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) {
					if (err) {
						console.error(err);
						return reject(err);
					}
					return resolve(result);
				})
				.end(buffer);
		});
		const { public_id: cloudId } = uploadStream as UploadApiResponse;
		const cloudURL = getURL(cloudId);

		console.log('cloudId:', cloudId);
		console.log('cloudURL:', cloudURL);

		return message(form, 'You have uploaded a valid file!');
	}
};
