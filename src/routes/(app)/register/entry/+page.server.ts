import { zod } from 'sveltekit-superforms/adapters';
import { message, superValidate } from 'sveltekit-superforms';
import { prisma } from '$lib/components/server/prisma';
import { entryCreateSchema } from '$lib/zod-schemas';

import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from '../$types';

export const load: PageServerLoad = async (event) => {
	const { session, user } = await event.locals.V1safeGetSession();
	if (!user || !session) redirect(302, '/login');
	console.log('register/entry +page.server.ts LOAD - START');
	const entryForm = await superValidate(zod(entryCreateSchema));
	return { entryForm };
};
