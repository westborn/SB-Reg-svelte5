import { prisma } from '$lib/components/server/prisma';
import type { RequestEvent } from './$types';

import { getSubmission, type User } from '$lib/components/server/registrationDB';
import { GENERIC_ERROR_MESSAGE } from '$lib/constants';

export async function POST(event: RequestEvent) {
	const { locals } = event;

	const { user } = await locals.V1safeGetSession();
	// Only superAdmins can update registration open/closed
	if (!user.isSuperAdmin) {
		console.log('Error in toggleOpenClosed - not superAdmin');
		return new Response(JSON.stringify({ message: 'Error in toggleOpenClosed' }), { status: 500 });
	}
	try {
		// Get the submission from the database
		const submissionFromDB = await getSubmission(user as User);
		if (!submissionFromDB) {
			console.error(`${event.route.id} - Getting DB Submission${GENERIC_ERROR_MESSAGE}`);
			return new Response(JSON.stringify({ message: 'Error in toggleOpenClosed - no submission' }), { status: 500 });
		}
		const registrationToUpdate = submissionFromDB?.registrations[0]?.id;
		const updatedRegistration = await prisma.registrationTable.update({
			where: { id: registrationToUpdate },
			data: {
				closed: !submissionFromDB?.registrations[0]?.closed
			}
		});
		if (!updatedRegistration) {
			console.error('Error Updating Registration closed status');
			return new Response(JSON.stringify({ message: 'Error in toggleOpenClosed - closed status' }), { status: 500 });
		}
	} catch (e) {
		console.error(e);
		return new Response(JSON.stringify({ message: 'Error in toggleOpenClosed - Unknown' }), { status: 500 });
	}
	return new Response(JSON.stringify({ message: 'success' }), { status: 200 });
}
