import { getSubmission, type Submission, type User } from '$lib/components/server/registrationDB';
import type { RequestEvent } from '../../$types';
import { GENERIC_ERROR_MESSAGE } from '$lib/constants';
import { sendGoogleEmail } from '$lib/components/server/mailer';
import { prisma } from '$lib/components/server/prisma';
import { registrationConfirmationEmail } from '$lib/server/email-templates';
import { logger } from '$lib/server/logger';

export async function POST(event: RequestEvent) {
	const { request, locals } = event;
	const { receiptURL } = await request.json();
	if (!receiptURL) {
		return new Response(JSON.stringify({ message: 'Error in registerComplete - no receipt' }), { status: 500 });
	}

	const { user } = await locals.V1safeGetSession();

	try {
		// Get the submission from the database
		const submissionFromDB = await getSubmission(user as User);
		if (!submissionFromDB) {
			await logger.error('Failed to get submission in registerComplete', new Error('No submission found'), {
				userId: user.id,
				userEmail: user.email,
				routeId: event.route.id
			});
			return new Response(JSON.stringify({ message: 'Error in registerComplete - no submission' }), { status: 500 });
		}
		const result = await sendRegistrationConfirmationEmail({
			submission: submissionFromDB,
			user
		});

		const registrationToUpdate = submissionFromDB?.registrations[0]?.id;
		const updatedRegistration = await prisma.registrationTable.update({
			where: { id: registrationToUpdate },
			data: {
				closed: true
			}
		});
		if (!updatedRegistration) {
			await logger.error('Failed to update registration closed status', new Error('Update registration failed'), {
				userId: user.id,
				userEmail: user.email,
				registrationId: registrationToUpdate,
				routeId: event.route.id
			});
			return new Response(JSON.stringify({ message: 'Error in registerComplete - closed status' }), { status: 500 });
		}

		// Log successful registration completion
		await logger.info('Registration completed successfully', {
			userId: user.id,
			userEmail: user.email,
			registrationId: registrationToUpdate,
			entryCount: submissionFromDB.registrations[0].entries.length,
			routeId: event.route.id
		});
	} catch (e) {
		await logger.error('Registration completion failed', e as Error, {
			userId: user.id,
			userEmail: user.email,
			routeId: event.route.id
		});
		return new Response(JSON.stringify({ message: 'Error in registerComplete - Unknown' }), { status: 500 });
	}
	return new Response(JSON.stringify({ message: 'success' }), { status: 200 });
}

/**
 * Sends a detailed registration confirmation email.
 * Uses registrationConfirmationEmail template from email-templates module.
 */
async function sendRegistrationConfirmationEmail({ submission, user }: { submission: Submission; user: User }) {
	const entriesData = submission?.registrations[0]?.entries;
	if (!entriesData) {
		await logger.error('Failed to get entries data for email', new Error('No entries data'), {
			userId: user.id,
			userEmail: user.email
		});
		return new Response(JSON.stringify({ message: 'Error Getting Submission -Entries' }), { status: 500 });
	}

	const registration = submission.registrations[0];
	const costOfRegistration = 20 + Number(entriesData.length) * 20;
	const artistName = `${submission.firstName} ${submission.lastName}`;

	// Transform entries data for the template
	const entries = entriesData.map((entry) => ({
		id: entry.id,
		inOrOut: entry.inOrOut ?? '',
		title: entry.title ?? '',
		description: entry.description ?? '',
		material: entry.material ?? '',
		dimensions: entry.dimensions ?? '',
		specialRequirements: entry.specialRequirements ?? '',
		price: entry.price ?? 0,
		primaryImageURL: entry.primaryImage?.image?.cloudURL || undefined
	}));

	// Use the email template
	const emailTemplate = registrationConfirmationEmail({
		artistName,
		registrationId: registration.id,
		email: submission.email,
		phone: submission.phone,
		postcode: submission.postcode,
		bankAccountName: submission.bankAccountName,
		bankBSB: submission.bankBSB,
		bankAccount: submission.bankAccount,
		bumpIn: registration.bumpIn,
		bumpOut: registration.bumpOut,
		displayRequirements: registration.displayRequirements,
		crane: registration.crane,
		entryCount: entriesData.length,
		cost: costOfRegistration,
		entries
	});

	const mailoptions = {
		from: 'Sculpture Bermagui<do_not_reply@sculpturebermagui.org.au>',
		to: user.email,
		subject: emailTemplate.subject,
		html: emailTemplate.html
	};

	try {
		await sendGoogleEmail(mailoptions);
	} catch (e) {
		console.error(e);
		return new Response(JSON.stringify({ message: 'Error Getting Submission -Email' }), { status: 500 });
	}

	return;
}
