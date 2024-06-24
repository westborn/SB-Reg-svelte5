import { zod } from 'sveltekit-superforms/adapters';
import { superValidate } from 'sveltekit-superforms';

import { redirect } from '@sveltejs/kit';
import { artistAddOrUpdateSchema, entryCreateSchema } from '$lib/zod-schemas';
import { getSubmission } from '$lib/components/server/registrationDB';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async (event) => {
	const { session, user } = await event.locals.V1safeGetSession();
	if (!user || !session) redirect(302, '/login');
	console.log('register +page.server.ts LOAD - START');

	const [createArtistForm, updateArtistForm, createEntryForm] = await Promise.all([
		superValidate(zod(artistAddOrUpdateSchema)),
		superValidate(zod(artistAddOrUpdateSchema)),
		superValidate(zod(entryCreateSchema))
	]);

	const artistEmail = user.email; //TODO: SB email?

	const submission = await getSubmission(artistEmail);
	!submission ? console.log('No Submission Found') : console.log('Submission Found', submission.id);

	return {
		submission,
		createArtistForm,
		updateArtistForm,
		createEntryForm
	};
};
