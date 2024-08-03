import type { Actions, PageServerLoad } from './$types';
import type { RequestEvent } from './$types';

import { zod } from 'sveltekit-superforms/adapters';
import { redirect } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { prisma } from '$lib/components/server/prisma';

import { ExhibitionYear, GENERIC_ERROR_MESSAGE, GENERIC_ERROR_UNEXPECTED, SUCCESS_MESSAGE } from '$lib/constants';
import { entrySchemaUI } from '$lib/zod-schemas';
import { getEntries } from '$lib/components/server/registrationDB';

export const load: PageServerLoad = async (event) => {
	const { session, user } = await event.locals.V1safeGetSession();
	if (!user || !session) redirect(302, '/login');
	console.log(`${event.route.id} - LOAD - START`);

	const entryForm = await superValidate(zod(entrySchemaUI));
	const artistEmail = user.email; // TODO Ensure email is correctly identified
	const result = await getEntries(artistEmail);
	if (!result) {
		console.log('No Artist Found');
	} else if (result && !result.registrations) {
		console.log('No Registration Found');
	} else if (result && result.registrations.length === 0) {
		console.log('No Entries Found');
	} else {
		console.log(`Entries Found - ${result.registrations[0].entries.length}`);
	}

	const entries = result?.registrations.length ? result.registrations[0].entries : [];
	return { entries, entryForm };
};

const updateEntry = async (event: RequestEvent) => {
	const form = await superValidate(event, zod(entrySchemaUI));
	if (!form.valid) {
		return message(form, 'Registration is Invalid - please reload and try again, or, call us!!', { status: 400 });
	}
	const { session, user } = await event.locals.V1safeGetSession();
	if (!user || !session) return redirect(302, '/login');

	try {
		const entryEmail = user.email; // TODO Assuming email is the correct identifier
		console.log('updateEntry', entryEmail);
		const result = await prisma.entryTable.update({
			where: { id: 1 },
			data: {}
		});

		if (!result) {
			console.log(`${event.route.id} - ${GENERIC_ERROR_MESSAGE}`);
			return message(form, GENERIC_ERROR_MESSAGE);
		}
	} catch (error) {
		console.log(`${event.route.id}`, error);
		return message(form, GENERIC_ERROR_MESSAGE);
	}

	return message(form, SUCCESS_MESSAGE);
};

const createEntry = async (event: RequestEvent) => {
	const form = await superValidate(event, zod(entrySchemaUI));
	if (!form.valid) {
		return message(form, 'Entry is Invalid - please reload and try again, or, call us!!', { status: 400 });
	}
	const { session, user } = await event.locals.V1safeGetSession();
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
		console.log(`${event.route.id} - ${GENERIC_ERROR_MESSAGE}`);
		return message(form, GENERIC_ERROR_MESSAGE);
	}
	const {
		title,
		price,
		inOrOut,
		material,
		specialRequirements,
		enterMajorPrize,
		description,
		dimHeight,
		dimLength,
		dimWidth
	} = form.data;

	try {
		const result = await prisma.entryTable.create({
			data: {
				artistId: registration.registrations[0].artistId,
				registrationId: registration.registrations[0].id,
				accepted: false,
				title: title || '',
				inOrOut: inOrOut === 'Outdoor' ? 'Outdoor' : 'Indoor',
				material: material || '',
				description: description || '',
				specialRequirements: specialRequirements || '',
				enterMajorPrize: enterMajorPrize === 'Yes' ? true : false,
				dimensions: `${dimLength || '0'}x${dimWidth || '0'}x${dimHeight || '0'}`,
				price: price * 100
			}
		});
		if (!result) {
			console.log(`${event.route.id} - ${GENERIC_ERROR_MESSAGE}`);
			return message(form, GENERIC_ERROR_MESSAGE);
		}
	} catch (error) {
		console.log(`${event.route.id} - `, error);
		return message(form, GENERIC_ERROR_UNEXPECTED);
	}

	return message(form, SUCCESS_MESSAGE);
};

export const actions: Actions = { updateEntry, createEntry };
