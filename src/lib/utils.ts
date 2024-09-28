import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import { EXHIBITION_YEAR } from './constants';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;

	const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (style: Record<string, number | string | undefined>): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, '');
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			});
		},
		easing: cubicOut
	};
};

export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// https://github.com/mats852/doublet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Callback = (...args: any) => any;
type Result<R> = [Error, null] | [null, R];
type MaybeAsyncResult<R> = R extends Promise<infer U> ? Promise<Result<U>> : Result<R>;
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

export function handleUnexpectedError(error: Error) {
	const msg = 'A network error has occurred. Check the apiUrl property to ensure it is set correctly.';
	console.error(error + ' - ' + msg);
	return msg;
}

export function handleError(lastStatus: LastStatus) {
	let msg = '';
	// console.log(lastStatus.status)
	switch (lastStatus.status) {
		case 400:
			msg = lastStatus.response[0] || 'something bad happened!';
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
	} else if (exhibitNumber >= 800 && exhibitNumber < 900) {
		return 'Street Gallery';
	}
}

export const convertToDollars = (price: number | null | undefined, decimals?: number) => {
	if (!price) return '';
	return (price / 100).toLocaleString('en-AU', {
		style: 'currency',
		maximumFractionDigits: decimals ?? 2,
		currency: 'AUD'
	});
};
