import { getSubmission, type Submission, type User } from '$lib/components/server/registrationDB';
import type { RequestEvent } from '../../$types';
import { GENERIC_ERROR_MESSAGE } from '$lib/constants';
import { sendGoogleEmail } from '$lib/components/server/mailer';
import { prisma } from '$lib/components/server/prisma';

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
			console.error(`${event.route.id} - Getting DB Submission${GENERIC_ERROR_MESSAGE}`);
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
			console.error('Error Updating Registration closed status');
			return new Response(JSON.stringify({ message: 'Error in registerComplete - closed status' }), { status: 500 });
		}
	} catch (e) {
		console.error(e);
		return new Response(JSON.stringify({ message: 'Error in registerComplete - Unknown' }), { status: 500 });
	}
	return new Response(JSON.stringify({ message: 'success' }), { status: 200 });
}

interface Entry {
	inOrOut: string;
	title: string;
	description: string;
	material: string;
	dimensions: string;
	specialRequirements: string;
	price: number | string;
	images: Image[];
}

interface Image {
	cloudURL: string;
}

/* Sends a detailed registration confirmation email.
Uses getFullRegistration and makeRegistrationHTML/makeEntriesHTML to construct email content. */
async function sendRegistrationConfirmationEmail({ submission, user }: { submission: Submission; user: User }) {
	const registrationHTML = makeRegistrationHTML(submission);
	const entriesData = submission?.registrations[0]?.entries;
	if (!entriesData) {
		console.error('Failed to get entries data');
		return new Response(JSON.stringify({ message: 'Error Getting Submission -Entries' }), { status: 500 });
	}
	const entriesHTML = makeEntriesHTML(
		entriesData.map((entry) => ({
			inOrOut: entry.inOrOut ?? '',
			title: entry.title ?? '',
			description: entry.description ?? '',
			material: entry.material ?? '',
			dimensions: entry.dimensions ?? '',
			specialRequirements: entry.specialRequirements ?? '',
			price: entry.price ?? '',
			images: entry.images ?? []
		}))
	);
	const costOfRegistration = 20 + Number(entriesData.length) * 20;
	const numberOfEntries = entriesData.length === 1 ? `1 entry` : `${entriesData.length} entries`;
	const headerHTML = `<p style="color: #1d4ed8; font-size: 30px;"> <br/>
   <img src="https://sculpturebermagui.org.au/wp-content/uploads/elementor/thumbs/SB-Logo-Small-q0ysuqmz4ozty2yo55sd6c4ag2ola7wghep8h8s5aa.png" width="200">
   <br/>
   Registration for ${submission.firstName} ${submission.lastName} (${submission.registrations[0].id})</p>
      <p style="color: #1d4ed8; font-size: 18px;">Your registration of ${numberOfEntries} has a total fee of $${costOfRegistration}</p>
    `;

	const htmlBody = headerHTML + registrationHTML + entriesHTML;

	const mailoptions = {
		from: 'Sculpture Bermagui<do_not_reply@sculpturebermagui.org.au>',
		to: user.email,
		subject: "✔ You've completed your Sculpture Exhibition Registration ✔",
		html: htmlBody
	};
	try {
		await sendGoogleEmail(mailoptions);
	} catch (e) {
		console.error(e);
		return new Response(JSON.stringify({ message: 'Error Getting Submission -Email' }), { status: 500 });
	}

	return;
}

/* Generates HTML for displaying registration details in an email. */
function makeRegistrationHTML(submission: Submission) {
	if (!submission) return '';
	if (submission.registrations.length === 0) return '';

	const registration = submission.registrations[0];
	const regData = {
		email: submission.email,
		phone: submission.phone,
		postcode: submission.postcode,
		bankAccountName: submission.bankAccountName,
		bankBSB: submission.bankBSB,
		bankAccount: submission.bankAccount,
		crane: registration.crane,
		bumpIn: registration.bumpIn,
		bumpOut: registration.bumpOut,
		displayRequirements: registration.displayRequirements
	};
	const regFields = [
		['Email', 'email'],
		['Phone', 'phone'],
		['Postcode', 'postcode'],
		['Bank Account', 'bankAccountName'],
		['BSB', 'bankBSB'],
		['Account', 'bankAccount'],
		['Bump In', 'bumpIn'],
		['Bump Out', 'bumpOut'],
		['Requirements', 'displayRequirements']
	];

	const registrationHTML = `
  <table style="font-family:'Arial';border-collapse:collapse;border-spacing:0;"><tbody>
  ${makeTableRows(regFields, regData)}
  </tbody></table>
  `;
	return registrationHTML;
}

/* Generates HTML for displaying registration details in an email. */
function makeEntriesHTML(entriesData: Entry[]): string {
	const entryFields: [string, keyof Entry][] = [
		['Indoor/Outdoor', 'inOrOut'],
		['Entry Title', 'title'],
		['Entry Description', 'description'],
		['Material', 'material'],
		['Dimensions', 'dimensions'],
		['Special Requirements', 'specialRequirements'],
		['Price', 'price']
	];

	const entryHTML = entriesData
		.map(
			(entry, idx) =>
				`<hr>
			<p style="color: #1d4ed8; font-size: 20px;">Entry # ${idx + 1}<br/>
			<table style="font-family:'Arial';border-collapse:collapse;border-spacing:0;"><tbody>
			${makeTableRows(entryFields, {
				...entry,
				price: (Number(entry.price) / 100).toLocaleString('en-AU', {
					style: 'currency',
					currency: 'AUD'
				})
			})}
			</tbody></table>
			<br/>
			<img src="${entry?.images[0]?.cloudURL ? entry.images[0].cloudURL : 'https://sculpturebermagui.org.au/wp-content/uploads/2024/10/no-image-provided.png'}" width="200">
			<br/>
			`
		)
		.join('');

	return entryHTML;
}

/* Generates HTML table rows based on field-value pairs. */
function makeTableRows<T extends Record<string, any>>(fields: [string, keyof T][] | string[][], data: T): string {
	return fields.map(([name, key]) => createTableRow(name, key ? (data?.[key as keyof T] ?? '') : '')).join('');
}

function createTableRow(name: string, value: string | number): string {
	const displayValue = typeof value === 'string' || typeof value === 'number' ? value : JSON.stringify(value);
	return `
	<tr>
			<td style="width:150px;border-style:none;text-align:left;padding-right:2px;padding-left:2px;background-color:#ffffff;color:#1d4ed8;">
					${name}
			</td>
			<td style="width:450px;border-style:none;text-align:left;padding-right:2px;padding-left:2px;background-color:#ffffff;color:#111827;">
					${displayValue}
			</td>
	</tr>
	`;
}
