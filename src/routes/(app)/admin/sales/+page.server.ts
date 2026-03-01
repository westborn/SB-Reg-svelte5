import { fail } from '@sveltejs/kit';
import type { Actions, RequestEvent } from '@sveltejs/kit';
import { SECRET_SQUARE_ACCESS_TOKEN } from '$env/static/private';
import { PUBLIC_SQUARE_ENVIRONMENT } from '$env/static/public';
import SquareOrderChecker, { type OrderSummaryRow } from '$lib/server/squareOrderChecker';
import { logger } from '$lib/server/logger';

type RangePreset = '2' | '7' | '10' | 'custom';

type FilterPayload = {
	rangePreset: RangePreset;
	startDate: string;
	endDate: string;
};

type PreviewPayload = {
	phase: 1 | 2;
	status: 'placeholder' | 'live';
	message: string;
	request: {
		type: 'quick-range' | 'custom-range';
		rangePreset: RangePreset;
		startDate: string;
		endDate: string;
	};
	sections: {
		summary: {
			totalOrders: number;
			totalLineItems: number;
			matched: number;
			unmatched: number;
			ambiguous: number;
			invalidSku: number;
			ignoredNotArt: number;
		};
		rawOrders: OrderSummaryRow[];
		matchCandidates: unknown[];
	};
	generatedAt: string;
};

const DEFAULT_FILTER: FilterPayload = {
	rangePreset: '7',
	startDate: '2025-03-07T00:00',
	endDate: '2025-03-08T00:00'
};

function isRangePreset(value: string): value is RangePreset {
	return value === '2' || value === '7' || value === '10' || value === 'custom';
}

function getFilterPayload(formData: FormData): FilterPayload {
	const rangePresetRaw = String(formData.get('rangePreset') ?? DEFAULT_FILTER.rangePreset);
	const rangePreset = isRangePreset(rangePresetRaw) ? rangePresetRaw : DEFAULT_FILTER.rangePreset;

	return {
		rangePreset,
		startDate: String(formData.get('startDate') ?? '').trim(),
		endDate: String(formData.get('endDate') ?? '').trim()
	};
}

function buildPlaceholderPreview(filter: FilterPayload): PreviewPayload {
	const requestType = filter.rangePreset === 'custom' ? 'custom-range' : 'quick-range';

	return {
		phase: 1,
		status: 'placeholder',
		message:
			'Phase 1 skeleton only: no Square API fetch or database updates are performed. Phase 2 will connect date filters to order retrieval.',
		request: {
			type: requestType,
			rangePreset: filter.rangePreset,
			startDate: filter.startDate,
			endDate: filter.endDate
		},
		sections: {
			summary: {
				totalOrders: 0,
				totalLineItems: 0,
				matched: 0,
				unmatched: 0,
				ambiguous: 0,
				invalidSku: 0,
				ignoredNotArt: 0
			},
			rawOrders: [],
			matchCandidates: []
		},
		generatedAt: new Date().toISOString()
	};
}

function parseDateInput(value: string): Date | null {
	if (!value) return null;
	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function buildLoggerContext(
	event: RequestEvent,
	user: Awaited<ReturnType<RequestEvent['locals']['V1safeGetSession']>>['user']
) {
	return {
		userId: user?.id,
		userEmail: user?.email,
		routeId: event.route.id,
		...(user?.isSuperAdmin && {
			adminAction: true,
			adminEmail: user.email,
			targetArtistEmail: user.proxyEmail
		})
	};
}

function buildLivePreview(filter: FilterPayload, rows: OrderSummaryRow[]): PreviewPayload {
	const totalLineItems = rows.length;
	const totalOrders = rows.filter((row) => row.orderAmountCents > 0).length;
	const requestType = filter.rangePreset === 'custom' ? 'custom-range' : 'quick-range';

	return {
		phase: 2,
		status: 'live',
		message: `Retrieved ${totalLineItems} order line items from Square.`,
		request: {
			type: requestType,
			rangePreset: filter.rangePreset,
			startDate: filter.startDate,
			endDate: filter.endDate
		},
		sections: {
			summary: {
				totalOrders,
				totalLineItems,
				matched: 0,
				unmatched: 0,
				ambiguous: 0,
				invalidSku: 0,
				ignoredNotArt: 0
			},
			rawOrders: rows,
			matchCandidates: []
		},
		generatedAt: new Date().toISOString()
	};
}

export const load = async () => {
	return {
		phase: 2,
		filterDefaults: DEFAULT_FILTER,
		contract: {
			fetchByQuickRange: {
				requiredField: 'rangePreset',
				allowedValues: ['2', '7', '10']
			},
			fetchByCustomRange: {
				requiredFields: ['startDate', 'endDate']
			},
			previewSections: ['summary', 'rawOrders', 'matchCandidates']
		}
	};
};

export const actions: Actions = {
	preview: async (event: RequestEvent) => {
		const { request } = event;
		const formData = await request.formData();
		const filter = getFilterPayload(formData);
		const { user } = await event.locals.V1safeGetSession();
		const logContext = buildLoggerContext(event, user);

		if (filter.rangePreset === 'custom' && (!filter.startDate || !filter.endDate)) {
			await logger.warn('Sales preview rejected: custom date range missing values', {
				...logContext,
				rangePreset: filter.rangePreset
			});
			return fail(400, {
				error: 'Start and end date/time are required when using a custom range.',
				submittedFilter: filter,
				preview: buildPlaceholderPreview(filter)
			});
		}

		if (!filter.startDate || !filter.endDate) {
			await logger.warn('Sales preview rejected: date range missing values', {
				...logContext,
				rangePreset: filter.rangePreset
			});
			return fail(400, {
				error: 'A start and end date/time are required to fetch Square orders.',
				submittedFilter: filter,
				preview: buildPlaceholderPreview(filter)
			});
		}

		const start = parseDateInput(filter.startDate);
		const end = parseDateInput(filter.endDate);

		if (!start || !end) {
			await logger.warn('Sales preview rejected: invalid date format', {
				...logContext,
				startDate: filter.startDate,
				endDate: filter.endDate,
				rangePreset: filter.rangePreset
			});
			return fail(400, {
				error: 'Invalid date format provided. Please choose valid date/time values.',
				submittedFilter: filter,
				preview: buildPlaceholderPreview(filter)
			});
		}

		if (start > end) {
			await logger.warn('Sales preview rejected: start date is after end date', {
				...logContext,
				startDate: filter.startDate,
				endDate: filter.endDate,
				rangePreset: filter.rangePreset
			});
			return fail(400, {
				error: 'Start date/time must be before or equal to end date/time.',
				submittedFilter: filter,
				preview: buildPlaceholderPreview(filter)
			});
		}

		await logger.info('Sales preview fetch started', {
			...logContext,
			rangePreset: filter.rangePreset,
			startDate: filter.startDate,
			endDate: filter.endDate
		});

		const checker = new SquareOrderChecker(SECRET_SQUARE_ACCESS_TOKEN, PUBLIC_SQUARE_ENVIRONMENT);
		const [squareError, rows] = await checker.getOrderSummaryByDateRange(start, end);

		if (squareError || !rows) {
			const status = squareError?.status ?? 502;
			const message = squareError?.message ?? 'Failed to fetch Square orders for selected range.';

			await logger.error('Sales preview fetch failed', new Error(message), {
				...logContext,
				rangePreset: filter.rangePreset,
				startDate: filter.startDate,
				endDate: filter.endDate,
				squareStatus: status
			});

			return fail(status, {
				error: message,
				submittedFilter: filter,
				preview: buildPlaceholderPreview(filter)
			});
		}

		const preview = buildLivePreview(filter, rows);

		await logger.info('Sales preview fetch completed', {
			...logContext,
			rangePreset: filter.rangePreset,
			startDate: filter.startDate,
			endDate: filter.endDate,
			totalOrders: preview.sections.summary.totalOrders,
			totalLineItems: preview.sections.summary.totalLineItems
		});

		return {
			submittedFilter: filter,
			preview
		};
	}
};
