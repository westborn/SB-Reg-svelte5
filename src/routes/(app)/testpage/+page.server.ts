import { fail, message, setError, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import type { RequestEvent } from './$types';
import { z } from 'zod';
import { zod } from 'sveltekit-superforms/adapters';
import { sendGoogleEmail } from '$lib/components/server/mailer';
import { getSubmission, type Submission, type User } from '$lib/components/server/registrationDB';
import { GENERIC_ERROR_MESSAGE } from '$lib/constants';
import type { Infer, SuperValidated } from 'sveltekit-superforms';

const emailSchema = z.object({
	email: z
		.string({ required_error: 'Email is required' })
		.email({ message: 'Email must be a valid email' })
		.toLowerCase()
});

export const load: PageServerLoad = async (event) => {
	console.log(`${event.route.id} - LOAD - START`);
	return {
		form: await superValidate(zod(emailSchema))
	};
};

const sendEmail = async (event: RequestEvent) => {
	const { user } = await event.locals.V1safeGetSession();

	const formValidationResult = await superValidate(event, zod(emailSchema));
	if (!formValidationResult.valid) {
		return message(formValidationResult, 'Registration is Invalid - please reload and try again, or, call us!!', {
			status: 400
		});
	}

	try {
		// Get the submission from the database
		const submissionFromDB = await getSubmission(user as User);
		if (!submissionFromDB) {
			console.error(`${event.route.id} - Getting DB Submission${GENERIC_ERROR_MESSAGE}`);
			return message(formValidationResult, GENERIC_ERROR_MESSAGE);
		}

		const result = await sendRegistrationConfirmationEmail({
			submission: submissionFromDB,
			user,
			formValidationResult
		});

		// console.log('sento res: ', result);
		return message(formValidationResult, 'Email sent successfully');
	} catch (e) {
		console.error(e);
		return message(formValidationResult, GENERIC_ERROR_MESSAGE);
	}
};

/* Sends a detailed registration confirmation email.
Uses getFullRegistration and makeRegistrationHTML/makeEntriesHTML to construct email content. */
async function sendRegistrationConfirmationEmail({
	submission,
	user,
	formValidationResult
}: {
	submission: Submission;
	user: User;
	formValidationResult: SuperValidated<Infer<typeof emailSchema>>;
}) {
	const registrationHTML = makeRegistrationHTML(submission);
	const entriesData = submission?.registrations[0]?.entries;
	if (!entriesData) {
		console.error('Failed to get entries data');
		return fail(500, {
			formValidationResult
		});
	}
	const entriesHTML = makeEntriesHTML(entriesData);
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
		to: user.isAdmin ? user.email : user.proxyEmail,
		subject: "✔ You've completed your Sculpture Exhibition Registration ✔",
		html: htmlBody
	};
	try {
		await sendGoogleEmail(mailoptions);
	} catch (e) {
		console.error(e);
		setError(formValidationResult, '', 'Failed to send email');
		return fail(500, {
			formValidationResult
		});
	}
	return formValidationResult;
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
			<img src="${entry.images[0].cloudURL}" width="200">
			<br/>
			`
		)
		.join('');

	return entryHTML;
}

/* Generates HTML table rows based on field-value pairs. */
function makeTableRows(fields: [string, keyof Entry][], data: Entry | Submission): string {
	return fields.map(([name, key]) => createTableRow(name, data[key])).join('');
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

export const actions: Actions = { sendEmail };
