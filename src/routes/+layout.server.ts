import { superValidate } from 'sveltekit-superforms';
import type { LayoutServerLoad } from './$types';
import { zod4 } from 'sveltekit-superforms/adapters';
import {
	artistSchemaUI,
	entryDeleteSchemaUI,
	entrySchemaUI,
	confirmSchemaUI,
	fileUploadSchema
} from '$lib/zod-schemas';

export const load: LayoutServerLoad = async (event) => {
	const [artistForm, entryForm, entryDeleteForm, confirmForm, imageUploadForm] = await Promise.all([
		superValidate(zod4(artistSchemaUI)),
		superValidate(zod4(entrySchemaUI)),
		superValidate(zod4(entryDeleteSchemaUI)),
		superValidate(zod4(confirmSchemaUI)),
		superValidate(zod4(fileUploadSchema))
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
