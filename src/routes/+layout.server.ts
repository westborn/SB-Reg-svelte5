import { superValidate } from 'sveltekit-superforms';
import type { LayoutServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { artistSchemaUI, entrySchemaUI, fileUploadSchema } from '$lib/zod-schemas';

export const load: LayoutServerLoad = async ({ locals: { V1safeGetSession }, cookies }) => {
	const { session, user } = await V1safeGetSession();
	console.log('+layout.server.ts LOAD - DONE');
	console.log('layout', user ? 'yes' : 'no');

	const [artistForm, entryForm, imageUploadForm] = await Promise.all([
		superValidate(zod(artistSchemaUI)),
		superValidate(zod(entrySchemaUI)),
		superValidate(zod(fileUploadSchema))
	]);

	return { universal: { session, user, cookies: cookies.getAll(), artistForm, entryForm, imageUploadForm } };
};
