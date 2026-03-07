import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import { EXHIBITION_YEAR } from './constants';

/**
 * Combines and merges Tailwind CSS classes using clsx and tailwind-merge.
 * Intelligently handles conflicting Tailwind classes.
 *
 * @param inputs - Class values to combine (strings, objects, arrays)
 * @returns Merged class string
 *
 * @example
 * cn('px-2 py-1', condition && 'bg-blue-500', { 'text-white': isActive })
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

/**
 * Pauses execution for a specified duration.
 *
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after the specified time
 *
 * @example
 * await sleep(1000); // Wait 1 second
 */
export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// https://github.com/mats852/doublet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Callback = (...args: any) => any;
type Result<R> = [Error, null] | [null, R];
type MaybeAsyncResult<R> = R extends Promise<infer U> ? Promise<Result<U>> : Result<R>;
/**
 * Wraps a callback function to return [error, result] tuple instead of throwing.
 * Handles both sync and async callbacks.
 *
 * @param cb - Callback function to wrap
 * @param args - Arguments to pass to the callback
 * @returns Tuple of [Error, null] on error or [null, Result] on success
 *
 * @example
 * const [err, data] = await doublet(fetchData, userId);
 * if (err) console.error(err);
 * else console.log(data);
 */
export default function doublet<TCallback extends Callback>(
	cb: TCallback,
	...args: Parameters<TCallback>
): MaybeAsyncResult<ReturnType<TCallback>> {
	try {
		const result = cb(...(args as Array<unknown>));

		if (result instanceof Promise) {
			return result.then((rx) => [null, rx]).catch((error) => [error, null]) as MaybeAsyncResult<ReturnType<TCallback>>;
		}

		return [null, result] as MaybeAsyncResult<ReturnType<TCallback>>;
	} catch (error) {
		return [error, null] as MaybeAsyncResult<ReturnType<TCallback>>;
	}
}

type LastStatus = {
	ok: boolean;
	status: number;
	statusText: string;
	url: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	response?: any;
};

export const apiResponse = {
	lastStatus: {
		ok: true,
		status: 200,
		statusText: 'OK',
		url: ''
	} as LastStatus
};

/**
 * Handles unexpected network errors with standard message.
 *
 * @param error - Error object from network failure
 * @returns User-friendly error message
 */
export function handleUnexpectedError(error: Error) {
	const msg = 'A network error has occurred. Check the apiUrl property to ensure it is set correctly.';
	console.error(error + ' - ' + msg);
	return msg;
}

/**
 * Processes HTTP error responses and returns appropriate error messages.
 *
 * @param lastStatus - Status object containing response details
 * @returns Formatted error message based on status code
 */
export function handleError(lastStatus: LastStatus) {
	let msg = '';
	const extractErrorMessage = (payload: unknown) => {
		if (typeof payload === 'string') return payload;
		if (Array.isArray(payload) && payload.length > 0) {
			const first = payload[0] as { detail?: string; message?: string; path?: string[] };
			if (first?.detail) return first.detail;
			if (first?.message && first?.path?.length) return `${first.path.join('.')} - ${first.message}`;
			if (first?.message) return first.message;
		}
		if (typeof payload === 'object' && payload !== null) {
			const obj = payload as { message?: string; detail?: string; errors?: unknown[] };
			if (obj.detail) return obj.detail;
			if (Array.isArray(obj.errors) && obj.errors.length > 0) {
				return extractErrorMessage(obj.errors);
			}
			if (obj.message) return obj.message;
		}
		return 'Something went wrong.';
	};
	// console.log(lastStatus.status)
	switch (lastStatus.status) {
		case 400:
			msg = extractErrorMessage(lastStatus.response);
			break;
		case 404:
			// console.log(404);
			if (lastStatus.response) {
				msg = lastStatus.response;
			} else {
				msg = `${lastStatus.statusText} - ${lastStatus.url}`;
			}
			break;
		case 500:
			// console.log(500);
			msg = JSON.parse(lastStatus.response).message;
			break;
		default:
			// console.log('default');
			msg = JSON.stringify(lastStatus);
			break;
	}
	return msg;
}

/**
 * Processes fetch Response objects and extracts JSON or text content.
 * Updates global apiResponse.lastStatus with response metadata.
 *
 * @param response - Fetch Response object
 * @returns Parsed JSON for successful/400 responses, text for others
 */
export async function processResponse(response: Response) {
	// console.log('processResponse commence:')
	// Copy reponse properties to lastStatus properties
	apiResponse.lastStatus.ok = response.ok;
	apiResponse.lastStatus.status = response.status;
	apiResponse.lastStatus.statusText = response.statusText;
	apiResponse.lastStatus.url = response.url;

	// console.log(apiResponse)
	if (apiResponse.lastStatus.ok || apiResponse.lastStatus.status === 400) {
		return await response.json();
	} else {
		return await response.text();
	}
}

/**
 * Determines the exhibition placement location based on exhibit number.
 * Pre-2024: Returns 'indoor' or 'outdoor'.
 * 2024+: Returns specific location names (Headland, Hotel, etc.) based on number ranges.
 *
 * @param exhibitNumberString - Exhibit number as string
 * @param entryYear - Year of the exhibition entry
 * @param inOrOut - Indoor or Outdoor designation
 * @returns Location name or designation
 *
 * @example
 * determinePlacement('150', '2024', 'Outdoor') // Returns 'Headland'
 * determinePlacement('450', '2024', 'Indoor') // Returns 'Hotel'
 */
export function determinePlacement(exhibitNumberString: string, entryYear: string, inOrOut: string) {
	// console.log(`exhibitNumberString: ${exhibitNumberString}, entryYear: ${entryYear}, inOrOut: ${inOrOut}`);
	// prior to 2024 just use "indoor" or "outdoor"
	if (entryYear.localeCompare('2024') < 0) {
		return inOrOut;
	}
	//no location determined yet
	if (!exhibitNumberString) {
		// but is this year's exhibition?
		if (entryYear.localeCompare(EXHIBITION_YEAR) === 0) {
			return inOrOut;
		} else {
			// not this year's exhibition
			return '??';
		}
	}

	const exhibitNumber = parseInt(exhibitNumberString);
	if (exhibitNumber >= 100 && exhibitNumber < 400) {
		return 'Headland';
	} else if (exhibitNumber >= 400 && exhibitNumber < 500) {
		return 'Hotel';
	} else if (exhibitNumber >= 500 && exhibitNumber < 800) {
		return 'Surf Gallery';
	} else if (exhibitNumber >= 800 && exhibitNumber < 850) {
		return 'Street Gallery';
	} else if (exhibitNumber >= 850 && exhibitNumber < 900) {
		return 'Shop 7 Artspace';
	}
}

/**
 * Converts price in cents to formatted currency string.
 *
 * @param price - Price in cents (or null/undefined)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string (e.g., '$50.00') or empty string if no price
 *
 * @example
 * convertToDollars(5000) // Returns '$50.00'
 * convertToDollars(5000, 0) // Returns '$50'
 */
export const convertToDollars = (price: number | null | undefined, decimals?: number) => {
	if (!price) return '';
	return (price / 100).toLocaleString('en-AU', {
		style: 'currency',
		maximumFractionDigits: decimals ?? 2,
		currency: 'AUD'
	});
};

// Step 8: Phase 3 refactoring - Price utility functions
import { BASE_REGISTRATION_COST, PER_ENTRY_COST } from './constants';

/**
 * Converts cents to a display string with dollar sign
 * @param cents - Amount in cents
 * @returns Formatted string like "$20.00"
 */
export function centsToDisplay(cents: number | null): string {
	if (cents === null) return '$0';
	return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Converts dollar amount to cents
 * @param dollars - Amount in dollars
 * @returns Amount in cents (rounded)
 */
export function displayToCents(dollars: number): number {
	return Math.round(dollars * 100);
}

/**
 * Calculates the total registration cost based on number of entries
 * @param entryCount - Number of entries
 * @returns Total cost in dollars
 */
export function calculateRegistrationCost(entryCount: number): number {
	return BASE_REGISTRATION_COST + entryCount * PER_ENTRY_COST;
}
