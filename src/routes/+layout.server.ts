import { superValidate } from 'sveltekit-superforms';
import type { LayoutServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import {
	artistSchemaUI,
	entryDeleteSchemaUI,
	entrySchemaUI,
	confirmSchemaUI,
	fileUploadSchema
} from '$lib/zod-schemas';

export const load: LayoutServerLoad = async (event) => {
	// console.log(`${event.route.id} - LAYOUTLOAD - START`);

	const [artistForm, entryForm, entryDeleteForm, confirmForm, imageUploadForm] = await Promise.all([
		superValidate(zod(artistSchemaUI)),
		superValidate(zod(entrySchemaUI)),
		superValidate(zod(entryDeleteSchemaUI)),
		superValidate(zod(confirmSchemaUI)),
		superValidate(zod(fileUploadSchema))
	]);

	return {
		cookies: event.cookies.getAll(),
		artistForm,
		entryForm,
		entryDeleteForm,
		confirmForm,
		imageUploadForm
	};
};
