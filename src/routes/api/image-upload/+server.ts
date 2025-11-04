import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { uploadImageToCloudinary } from '$lib/components/server/cloudinary';
import { createImage } from '$lib/components/server/registrationDB';
import { getSubmission } from '$lib/components/server/registrationDB';
import type { CurrentImage, User } from '$lib/components/server/registrationDB';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		// Get the session to ensure user is authenticated
		const { user } = await locals.V1safeGetSession();
		if (!user) {
			throw error(401, 'Unauthorized');
		}

		// Parse the form data
		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file || !(file instanceof File)) {
			throw error(400, 'No file provided');
		}

		// Get the submission from the database
		const submissionFromDB = await getSubmission(user as User);
		if (!submissionFromDB) {
			throw error(404, 'No submission found');
		}

		// Upload to Cloudinary
		const uploadResult = await uploadImageToCloudinary(file, 'UnAttachedImages');
		if (!uploadResult.success) {
			console.error('Error uploading image to Cloudinary:', uploadResult);
			throw error(500, 'Failed to upload image to Cloudinary');
		}

		// Extract Cloudinary URL and ID from the successful upload result
		const { public_id: cloudId, secure_url: cloudURL } = uploadResult.result;

		// Save to database
		const newImage = await createImage({
			id: 0,
			artistId: submissionFromDB.id,
			cloudId,
			cloudURL,
			originalFileName: file.name
		} as CurrentImage);

		return json({
			success: true,
			image: newImage
		});
	} catch (err) {
		console.error('Error in image upload API:', err);

		if (err && typeof err === 'object' && 'status' in err) {
			// Re-throw SvelteKit errors
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};
