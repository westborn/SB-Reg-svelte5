import type { RequestEvent } from './$types';

import { getSubmission, type User, updateRegistration } from '$lib/components/server/registrationDB';
import { GENERIC_ERROR_MESSAGE } from '$lib/constants';
import { logger } from '$lib/server/logger';

export async function POST(event: RequestEvent) {
	const { locals } = event;

	const { user } = await locals.V1safeGetSession();
	if (!user) {
		return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
	}
	// Only superAdmins can update registration open/closed
	if (!user.isSuperAdmin) {
		await logger.warn('Rejected toggleOpenClosed call from non-super-admin user', {
			userId: user.id,
			userEmail: user.email,
			routeId: event.route.id
		});
		return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
	}
	try {
		// Get the submission from the database
		const submissionFromDB = await getSubmission(user as User);
		if (!submissionFromDB) {
			await logger.error('Failed to load submission for toggleOpenClosed', new Error(GENERIC_ERROR_MESSAGE), {
				userId: user.id,
				userEmail: user.email,
				routeId: event.route.id
			});
			return new Response(JSON.stringify({ message: 'Error in toggleOpenClosed - no submission' }), { status: 500 });
		}
		const registrationToUpdate = submissionFromDB?.registrations[0]?.id;
		if (!registrationToUpdate) {
			return new Response(JSON.stringify({ message: 'Error in toggleOpenClosed - no registration' }), { status: 500 });
		}
		const updatedRegistration = await updateRegistration(registrationToUpdate, {
			closed: !submissionFromDB?.registrations[0]?.closed
		});
		if (!updatedRegistration) {
			await logger.error('Registration closed status update returned no result', new Error('Update failed'), {
				userId: user.id,
				userEmail: user.email,
				registrationId: registrationToUpdate,
				routeId: event.route.id
			});
			return new Response(JSON.stringify({ message: 'Error in toggleOpenClosed - closed status' }), { status: 500 });
		}

		await logger.info('Toggled registration closed status', {
			userId: user.id,
			userEmail: user.email,
			registrationId: registrationToUpdate,
			closed: updatedRegistration.closed,
			routeId: event.route.id,
			adminAction: true,
			adminEmail: user.email,
			targetArtistEmail: user.proxyEmail
		});
	} catch (e) {
		await logger.error('toggleOpenClosed failed', e as Error, {
			userId: user.id,
			userEmail: user.email,
			routeId: event.route.id
		});
		return new Response(JSON.stringify({ message: 'Error in toggleOpenClosed - Unknown' }), { status: 500 });
	}
	return new Response(JSON.stringify({ message: 'success' }), { status: 200 });
}
