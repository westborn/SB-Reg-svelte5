import { json } from '@sveltejs/kit';
import { getEntryImagesWithPrimary } from '$lib/components/server/registrationDB';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const entryId = url.searchParams.get('entryId');

	if (!entryId) {
		return json({ error: 'entryId parameter is required' }, { status: 400 });
	}

	const entryIdNum = parseInt(entryId, 10);
	if (isNaN(entryIdNum)) {
		return json({ error: 'entryId must be a valid number' }, { status: 400 });
	}

	try {
		const result = await getEntryImagesWithPrimary(entryIdNum);

		if (!result) {
			return json({ error: 'Entry not found' }, { status: 404 });
		}

		return json({
			images: result.images,
			primaryImageId: result.primaryImageId
		});
	} catch (error) {
		console.error('Error fetching entry images:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
