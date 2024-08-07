import { CLOUDINARY_API_SECRET, CLOUDINARY_API_KEY } from '$env/static/private';
import { PUBLIC_CLOUDINARY_CLOUD_NAME } from '$env/static/public';

import cloudinary, { type UploadApiErrorResponse, type UploadApiResponse } from 'cloudinary';

const cloudinaryConfig = {
	cloud_name: PUBLIC_CLOUDINARY_CLOUD_NAME,
	api_key: CLOUDINARY_API_KEY,
	api_secret: CLOUDINARY_API_SECRET,
	secure: true
};
cloudinary.v2.config({ cloudinaryConfig });

export function fetchImagePath(imagePath: string) {
	return cloudinary.v2.url(imagePath, { secure: true });
}

export interface CloudinaryUploadResponse {
	success: boolean;
	result: {
		url: string;
		format: string;
		bytes: number;
		etag: string;
		secure_url: string;
		resource_type: string;
		created_at: string;
		tags: unknown[];
		width: number;
		height: number;
		public_id: string;
		version: number;
		type: string;
		signature: string;
	};
}
// takes in an Image and a Preset and returns a promise that resolves to a CloudinaryUploadResponse
export async function uploadImageToCloudinary(
	image: File | undefined,
	preset: string
): Promise<CloudinaryUploadResponse> {
	if (!image) {
		// handle case where image is undefined
		return Promise.reject(new Error('Image not provided'));
	}
	const arrayBuffer = await image.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);
	return new Promise((resolve, reject) => {
		cloudinary.v2.uploader.upload_stream({ upload_preset: preset }, onDone).end(buffer);

		function onDone(error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) {
			if (error) {
				console.error(error);
				return reject({ success: false, error });
			}
			return resolve({ success: true, result } as CloudinaryUploadResponse);
		}
	});
}

export function getCloudinaryURL(public_id: string) {
	return cloudinary.v2.url(public_id, { secure: true });
}

// export async function destroy(path: string) {
// 	cloudinary.v2.uploader.destroy(path, function (error, result) {
// 		console.log(result, error);
// 	});
// }
