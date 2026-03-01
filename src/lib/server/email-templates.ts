/**
 * Email Templates Module
 *
 * This module contains all email template functions for the Sculpture Bermagui Registration System.
 * Templates are separated from business logic to improve maintainability and allow for easier updates.
 *
 * Each template function returns an object with:
 * - subject: Email subject line
 * - html: HTML email body
 * - text: Plain text fallback (optional, for future use)
 */

import type { Submission } from '$lib/components/server/registrationDB';

/**
 * Transforms a Cloudinary URL to include optimizations for email display.
 * Converts images to JPG format and applies aspect ratio cropping.
 *
 * Converts images to JPG format (f_jpg)
 * Applies 1:1 aspect ratio cropping (ar_1:1,c_fill)
 * Sets automatic quality optimization (q_auto:good)
 * Limits width to 400px (w_400)
 *
 * @param url - Original Cloudinary URL
 * @param transformations - Cloudinary transformations to apply (default: ar_1:1,c_fill,f_jpg,q_auto:good)
 * @returns Transformed Cloudinary URL or original URL if not a Cloudinary URL
 */
function transformCloudinaryImageForEmail(
	url: string,
	transformations: string = 'ar_1:1,c_fill,f_jpg,q_auto:good,w_400'
): string {
	// Check if this is a Cloudinary URL
	const cloudinaryPattern = /^(https?:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/)(.+)$/;
	const match = url.match(cloudinaryPattern);

	if (!match) {
		// Not a Cloudinary URL, return as-is
		return url;
	}

	const [, baseUrl, publicIdWithPath] = match;

	// Insert transformations before the public_id
	return `${baseUrl}${transformations}/${publicIdWithPath}`;
}

/**
 * Email template data structure for entries
 */
interface EntryEmailData {
	id: number;
	inOrOut: string;
	title: string;
	description: string;
	material: string;
	dimensions: string;
	specialRequirements: string;
	price: number | string;
	primaryImageURL?: string;
}

/**
 * Generates the registration confirmation email template
 *
 * @param data - Registration data including artist info and entries
 * @returns Email template with subject and HTML body
 */
export function registrationConfirmationEmail(data: {
	artistName: string;
	registrationId: number;
	email: string;
	phone: string;
	postcode: string;
	bankAccountName: string | null;
	bankBSB: string | null;
	bankAccount: string | null;
	bumpIn: string | null;
	bumpOut: string | null;
	displayRequirements: string | null;
	crane: boolean;
	entryCount: number;
	cost: number;
	entries: EntryEmailData[];
}): {
	subject: string;
	html: string;
	text: string;
} {
	const numberOfEntries = data.entryCount === 1 ? `1 entry` : `${data.entryCount} entries`;

	const headerHTML = `
		<p style="color: #1d4ed8; font-size: 30px;"> <br/>
			<img src="https://sculpturebermagui.org.au/wp-content/uploads/elementor/thumbs/SB-Logo-Small-q0ysuqmz4ozty2yo55sd6c4ag2ola7wghep8h8s5aa.png" width="200">
			<br/>
			Registration for ${data.artistName} (${data.registrationId})
		</p>
		<p style="color: #1d4ed8; font-size: 18px;">
			Your registration of ${numberOfEntries} has a total fee of $${data.cost}
		</p>
	`;

	const registrationHTML = makeRegistrationHTML({
		email: data.email,
		phone: data.phone,
		postcode: data.postcode,
		bankAccountName: data.bankAccountName,
		bankBSB: data.bankBSB,
		bankAccount: data.bankAccount,
		bumpIn: data.bumpIn,
		bumpOut: data.bumpOut,
		displayRequirements: data.displayRequirements
	});

	const entriesHTML = makeEntriesHTML(data.entries);

	const htmlBody = headerHTML + registrationHTML + entriesHTML;

	return {
		subject: "✔ You've completed your Sculpture Exhibition Registration ✔",
		html: htmlBody,
		text: `Registration confirmation for ${data.artistName}. Your registration of ${numberOfEntries} has a total fee of $${data.cost}.`
	};
}

/**
 * Generates HTML for displaying registration details
 */
function makeRegistrationHTML(data: {
	email: string;
	phone: string;
	postcode: string;
	bankAccountName: string | null;
	bankBSB: string | null;
	bankAccount: string | null;
	bumpIn: string | null;
	bumpOut: string | null;
	displayRequirements: string | null;
}): string {
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

	return `
		<table style="font-family:'Arial';border-collapse:collapse;border-spacing:0;">
			<tbody>
				${makeTableRows(regFields, data)}
			</tbody>
		</table>
	`;
}

/**
 * Generates HTML for displaying entry details
 */
function makeEntriesHTML(entries: EntryEmailData[]): string {
	const entryFields: [string, keyof EntryEmailData][] = [
		['Indoor/Outdoor', 'inOrOut'],
		['Entry Title', 'title'],
		['Entry Description', 'description'],
		['Material', 'material'],
		['Dimensions', 'dimensions'],
		['Special Requirements', 'specialRequirements'],
		['Price', 'price']
	];

	return entries
		.map((entry) => {
			const fallbackImage = 'https://sculpturebermagui.org.au/wp-content/uploads/2024/10/no-image-provided.png';
			const originalImageURL = entry.primaryImageURL || fallbackImage;
			// Transform Cloudinary URLs to optimize for email display
			const primaryImageURL = transformCloudinaryImageForEmail(originalImageURL);

			const formattedPrice =
				typeof entry.price === 'number'
					? (entry.price / 100).toLocaleString('en-AU', {
							style: 'currency',
							currency: 'AUD'
						})
					: entry.price;

			return `
				<hr>
				<p style="color: #1d4ed8; font-size: 20px;">Entry # ${entry.id}</p>
				<table style="font-family:'Arial';border-collapse:collapse;border-spacing:0;">
					<tbody>
						${makeTableRows(entryFields, { ...entry, price: formattedPrice })}
					</tbody>
				</table>
				<br/>
				<img src="${primaryImageURL}" width="200">
				<br/>
			`;
		})
		.join('');
}

/**
 * Generates HTML table rows based on field-value pairs
 */
function makeTableRows<T extends Record<string, any>>(fields: [string, keyof T][] | string[][], data: T): string {
	return fields.map(([name, key]) => createTableRow(name, key ? (data?.[key as keyof T] ?? '') : '')).join('');
}

/**
 * Creates a single HTML table row
 */
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
