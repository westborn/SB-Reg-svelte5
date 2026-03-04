import { updateEntry } from '$lib/components/server/registrationDB';
import { logger } from '$lib/server/logger';
import type { RequestEvent } from './$types';

export async function POST(event: RequestEvent) {
	const { request, locals } = event;
	const { entryId, accepted } = await request.json();

	if (!entryId) {
		return new Response(JSON.stringify({ message: 'Error in acceptEntry - no entryId' }), { status: 500 });
	}
	const { user } = await locals.V1safeGetSession();
	if (!user) {
		return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
	}
	// Only admins can update entries to accepted
	if (!user.isAdmin) {
		await logger.warn('Rejected updateAccepted call from non-admin user', {
			userId: user.id,
			userEmail: user.email,
			entryId,
			routeId: event.route.id
		});
		return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
	}
	try {
		await updateEntry(entryId, {
			accepted: !accepted
		});
	} catch (error) {
		await logger.error('Failed to update accepted status', error as Error, {
			userId: user.id,
			userEmail: user.email,
			entryId,
			routeId: event.route.id
		});
		return new Response(JSON.stringify({ message: 'Error in getExhibits' }), { status: 500 });
	}

	await logger.info('Updated accepted status', {
		userId: user.id,
		userEmail: user.email,
		entryId,
		accepted: !accepted,
		routeId: event.route.id
	});
	return new Response('', { status: 200 });
}
