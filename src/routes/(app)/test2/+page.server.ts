import type { Actions, PageServerLoad } from './$types';

import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/components/server/prisma';

import { ExhibitionYear, GENERIC_ERROR_MESSAGE } from '$lib/constants';
import { getEntries } from '$lib/components/server/registrationDB';

export const load: PageServerLoad = async (event) => {
	const { session, user } = await event.locals.V1safeGetSession();
	if (!user || !session) redirect(302, '/login');
	console.log(`${event.route.id} - LOAD - START`);
	const artistEmail = user.email; // TODO Ensure email is correctly identified
	const result = await getEntries(artistEmail);
	!result ? console.log('No Entries Found') : console.log(`Entries Found - ${result.registrations[0].entries.length}`);
	const currentEntries = result?.registrations.length ? result.registrations[0].entries : [];
	return { currentEntries };
};

export const actions: Actions = {
	createEntry: async ({ request, locals, route }) => {
		const form = await request.formData();
		const { session, user } = await locals.V1safeGetSession();
		if (!user || !session) return redirect(302, '/login');

		// get the registration id and the artist id from the registration table by using the artist email

		const artistEmail = user.email; // TODO Ensure email is correctly identified
		const registration = await prisma.artistTable.findUnique({
			where: {
				email: artistEmail
			},
			select: {
				registrations: {
					where: { registrationYear: ExhibitionYear.toString() },
					select: {
						artistId: true,
						id: true
					}
				}
			}
		});

		if (!registration) {
			console.log(`${route.id} - ${GENERIC_ERROR_MESSAGE}`);
			return fail(400, { form, missing: true });
		}
		const title = form.get('title');
		const price = form.get('price');
		const inOrOut = form.get('inOrOut');
		const material = form.get('material');
		const specialRequirements = form.get('specialRequirements');
		const enterMajorPrize = form.get('enterMajorPrize');
		const description = form.get('description');
		const dimHeight = form.get('dimHeight');
		const dimLength = form.get('dimLength');
		const dimWidth = form.get('dimWidth');

		try {
			const result = await prisma.entryTable.create({
				data: {
					artistId: registration.registrations[0].artistId,
					registrationId: registration.registrations[0].id,
					accepted: false,
					title: title ?? '',
					inOrOut: inOrOut === 'Outdoor' ? 'Outdoor' : 'Indoor',
					material: material ?? '',
					description: description ?? '',
					specialRequirements: specialRequirements ?? '',
					enterMajorPrize: enterMajorPrize === 'Yes' ? true : false,
					dimensions: `${dimLength ?? '0'}x${dimWidth ?? '0'}x${dimHeight ?? '0'}`,
					price: price * 100
				}
			});
			if (!result) {
				console.log(`${route.id} - ${GENERIC_ERROR_MESSAGE}`);
				return fail(400, { form, missing: true });
			}
		} catch (error) {
			console.log(`${route.id} - `, error);
			return fail(400, { form, missing: true });
		}

		return { success: true };
	}
};
