import { error } from '@sveltejs/kit';
import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_API_SECRET, CLOUDINARY_API_KEY } from '$env/static/private';
import { PUBLIC_CLOUDINARY_CLOUD_NAME } from '$env/static/public';

cloudinary.config({
	cloud_name: PUBLIC_CLOUDINARY_CLOUD_NAME,
	api_key: CLOUDINARY_API_KEY,
	api_secret: CLOUDINARY_API_SECRET,
	secure: true
});
/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ request }) => {
		try {
			/*
			 * @type {FormData}
			 */
			const formData = await request.formData();
			/**
			 * @type {FormDataEntryValue | null}
			 */
			const fileData: FormDataEntryValue | null = formData.get('file');
			let uploadStream = null;
			if (fileData instanceof File) {
				const arrayBuffer = await fileData.arrayBuffer();
				const buffer = new Uint8Array(arrayBuffer);
				uploadStream = await new Promise((resolve, reject) => {
					cloudinary.uploader
						.upload_stream({}, function (error: any, result: unknown) {
							if (error) {
								return reject(error);
							}
							return resolve(result);
						})
						.end(buffer);
				});
			}

			const uploadStreamTyped = uploadStream as { url: string };
			return { success: true, image: uploadStreamTyped.url };
		} catch (er) {
			console.error(er);
			return error(500);
		}
	}
};
