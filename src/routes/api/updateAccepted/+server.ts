import { prisma } from '$lib/components/server/prisma';
import type { RequestEvent } from './$types';

export async function POST(event: RequestEvent) {
	const { request, locals } = event;
	const { entryId, accepted } = await request.json();

	if (!entryId) {
		return new Response(JSON.stringify({ message: 'Error in acceptEntry - no entryId' }), { status: 500 });
	}
	const { user } = await locals.V1safeGetSession();
	// Only admins can update entries to accepted
	if (!user.isAdmin) {
		console.log('Error in acceptEntry - not admin');
		return new Response(JSON.stringify({ message: 'Error in acceptEntry' }), { status: 500 });
	}
	try {
		await prisma.entryTable.update({
			where: { id: entryId },
			data: { accepted: !accepted }
		});
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.log('Error in getExhibits:', error.message);
		return new Response(JSON.stringify({ message: 'Error in getExhibits' }), { status: 500 });
	}
	return new Response('', { status: 200 });
}
