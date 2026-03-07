import { fail } from '@sveltejs/kit';
import type { Actions, RequestEvent } from '@sveltejs/kit';
import { SECRET_SQUARE_ACCESS_TOKEN } from '$env/static/private';
import { PUBLIC_SQUARE_ENVIRONMENT } from '$env/static/public';
import SquareOrderChecker, { type OrderSummaryRow } from '$lib/server/squareOrderChecker';
import { logger } from '$lib/server/logger';
import { getExhibits, updateEntry, type Exhibit } from '$lib/components/server/registrationDB';
import { EXHIBITION_YEAR } from '$lib/constants';

type RangePreset = '2' | '7' | '10' | 'custom';

type FilterPayload = {
	rangePreset: RangePreset;
	startDate: string;
	endDate: string;
};

function toDateInputString(date: Date): string {
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getDefaultFilter(): FilterPayload {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const start = new Date(today);
	start.setDate(start.getDate() - 7);

	return {
		rangePreset: '7',
		startDate: toDateInputString(start),
		endDate: toDateInputString(today)
	};
}

type ParsedSku = {
	exhibitNumber: string;
	artistName: string;
	entryId: number;
};

type ClassifiedOrderRow = OrderSummaryRow & {
	parsedSku: ParsedSku;
};

type InvalidSkuRow = OrderSummaryRow & {
	reason: string;
};

type MatchCandidate = {
	entryId: number;
	exhibitNumber: string;
	artistName: string;
	title: string;
	sold: boolean;
};

type MatchedRow = ClassifiedOrderRow & {
	matchedEntry: MatchCandidate;
	matchStatus: 'matched' | 'alreadySold';
	potentialReturn: boolean;
};

type UnmatchedRow = ClassifiedOrderRow & {
	reason: string;
	candidates: MatchCandidate[];
};

type AmbiguousRow = ClassifiedOrderRow & {
	reason: string;
	candidates: MatchCandidate[];
};

type CanceledRow = ClassifiedOrderRow & {
	reason: string;
};

type ReturnedOrderRow = OrderSummaryRow & {
	returnOrderId: string;
	sourceOrderId: string;
	originalOrder?: OrderSummaryRow;
};

type PreviewPayload = {
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
			canceled: number;
			unmatched: number;
			ambiguous: number;
			invalidSku: number;
			ignoredNotArt: number;
			returned: number;
		};
		rawOrders: OrderSummaryRow[];
		matchCandidates: ClassifiedOrderRow[];
		invalidSkuRows: InvalidSkuRow[];
		ignoredNotArtRows: OrderSummaryRow[];
		matchedRows: MatchedRow[];
		alreadySoldRows: MatchedRow[];
		unmatchedRows: UnmatchedRow[];
		ambiguousRows: AmbiguousRow[];
		canceledRows: CanceledRow[];
		returnedRows: ReturnedOrderRow[];
	};
	generatedAt: string;
};

type SoldUpdateResult = {
	requested: number;
	updated: number;
	alreadySold: number;
	notEligible: number;
	failed: number;
	failedEntries: Array<{ entryId: number; reason: string }>;
};

const DEFAULT_FILTER: FilterPayload = getDefaultFilter();

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
		message: 'Preview unavailable. Check filter values and retry.',
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
				canceled: 0,
				unmatched: 0,
				ambiguous: 0,
				invalidSku: 0,
				ignoredNotArt: 0,
				returned: 0
			},
			rawOrders: [],
			matchCandidates: [],
			invalidSkuRows: [],
			ignoredNotArtRows: [],
			matchedRows: [],
			alreadySoldRows: [],
			unmatchedRows: [],
			ambiguousRows: [],
			canceledRows: [],
			returnedRows: []
		},
		generatedAt: new Date().toISOString()
	};
}

function normalizeArtistName(value: string): string {
	return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function toMatchCandidate(exhibit: Exhibit): MatchCandidate {
	return {
		entryId: exhibit.entryId,
		exhibitNumber: exhibit.exhibitNumber ?? '',
		artistName: exhibit.artistName,
		title: exhibit.title,
		sold: exhibit.sold
	};
}

function matchParsedRows(parsedValid: ClassifiedOrderRow[], exhibits: Exhibit[]) {
	const matchedRows: MatchedRow[] = [];
	const alreadySoldRows: MatchedRow[] = [];
	const unmatchedRows: UnmatchedRow[] = [];
	const ambiguousRows: AmbiguousRow[] = [];
	const canceledRows: CanceledRow[] = [];

	for (const row of parsedValid) {
		if (row.state === 'CANCELED') {
			canceledRows.push({
				...row,
				reason: 'Order state is CANCELED. Excluded from sold updates.'
			});
			continue;
		}
		const candidatesByEntry = exhibits.filter((exhibit) => exhibit.entryId === row.parsedSku.entryId);

		if (candidatesByEntry.length === 0) {
			unmatchedRows.push({
				...row,
				reason: `No exhibit found for entry id ${row.parsedSku.entryId}`,
				candidates: []
			});
			continue;
		}

		const strictMatches = candidatesByEntry.filter((exhibit) => {
			const exhibitNumberMatches = (exhibit.exhibitNumber ?? '') === row.parsedSku.exhibitNumber;
			const artistMatches = normalizeArtistName(exhibit.artistName).includes(
				normalizeArtistName(row.parsedSku.artistName)
			);
			const priceMatches = row.baseAmountCents === exhibit.price;
			return exhibitNumberMatches && artistMatches && priceMatches;
		});

		if (strictMatches.length > 1) {
			ambiguousRows.push({
				...row,
				reason: 'Multiple exhibits matched this SKU. Manual review required.',
				candidates: strictMatches.map(toMatchCandidate)
			});
			continue;
		}

		if (strictMatches.length === 0) {
			const candidates = candidatesByEntry.map(toMatchCandidate);
			const onlyCandidate = candidatesByEntry[0];

			let reason = 'Entry found but exhibit number and/or artist name did not match SKU.';
			if (candidatesByEntry.length === 1) {
				const exhibitNumberMatches = (onlyCandidate.exhibitNumber ?? '') === row.parsedSku.exhibitNumber;
				const artistMatches = normalizeArtistName(onlyCandidate.artistName).includes(
					normalizeArtistName(row.parsedSku.artistName)
				);
				const priceMatches = row.baseAmountCents === onlyCandidate.price;

				if (!exhibitNumberMatches && artistMatches) {
					reason = `Exhibit number mismatch: expected ${onlyCandidate.exhibitNumber || '(blank)'}, got ${row.parsedSku.exhibitNumber}`;
				} else if (exhibitNumberMatches && !artistMatches) {
					reason = `Artist name mismatch: expected "${onlyCandidate.artistName}", got "${row.parsedSku.artistName}"`;
				} else if (exhibitNumberMatches && artistMatches && !priceMatches) {
					reason = `Price mismatch: expected ${onlyCandidate.price}c, got ${row.baseAmountCents}c`;
				}
			}

			unmatchedRows.push({
				...row,
				reason,
				candidates
			});
			continue;
		}

		const matchedCandidate = strictMatches[0];
		const matchedRow: MatchedRow = {
			...row,
			matchedEntry: toMatchCandidate(matchedCandidate),
			matchStatus: matchedCandidate.sold ? 'alreadySold' : 'matched',
			potentialReturn: false
		};

		if (matchedCandidate.sold) {
			alreadySoldRows.push(matchedRow);
		} else {
			matchedRows.push(matchedRow);
		}
	}

	return {
		matchedRows,
		alreadySoldRows,
		unmatchedRows,
		ambiguousRows,
		canceledRows
	};
}

function parseSku(sku: string): { parsed: ParsedSku | null; reason?: string } {
	const trimmedSku = sku.trim();
	const match = trimmedSku.match(/^(\d{3})\s-\s(.+)\s-\s(\d+)$/);

	if (!match) {
		return { parsed: null, reason: 'SKU does not match required format: nnn - xxxxxxx - iiii' };
	}

	const [, exhibitNumber, artistNameRaw, entryIdRaw] = match;
	const artistName = artistNameRaw.trim();
	const entryId = Number.parseInt(entryIdRaw, 10);

	if (!artistName) {
		return { parsed: null, reason: 'Artist name segment is empty' };
	}

	if (!Number.isFinite(entryId) || entryId <= 0) {
		return { parsed: null, reason: 'Entry id segment is invalid' };
	}

	return {
		parsed: {
			exhibitNumber,
			artistName,
			entryId
		}
	};
}

function classifyRows(rows: OrderSummaryRow[]) {
	const parsedValid: ClassifiedOrderRow[] = [];
	const invalidSkuRows: InvalidSkuRow[] = [];
	const ignoredNotArtRows: OrderSummaryRow[] = [];

	for (const row of rows) {
		const sku = row.sku?.trim() ?? '';
		if (sku === 'Not Art') {
			ignoredNotArtRows.push(row);
			continue;
		}

		const { parsed, reason } = parseSku(sku);
		if (!parsed) {
			invalidSkuRows.push({ ...row, reason: reason ?? 'Invalid SKU format' });
			continue;
		}

		parsedValid.push({ ...row, parsedSku: parsed });
	}

	return {
		parsedValid,
		invalidSkuRows,
		ignoredNotArtRows
	};
}

function parseDateInput(value: string): Date | null {
	if (!value) return null;

	const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (dateOnlyMatch) {
		const [, year, month, day] = dateOnlyMatch;
		const parsed = new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0, 0);
		return Number.isNaN(parsed.getTime()) ? null : parsed;
	}

	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toFullDaySearchRange(startDate: Date, endDate: Date): { start: Date; end: Date } {
	const start = new Date(startDate);
	start.setHours(0, 0, 0, 0);

	const end = new Date(endDate);
	end.setHours(23, 59, 59, 999);

	return { start, end };
}

function getEntryYearForDate(startDate: Date): string {
	const startYear = String(startDate.getFullYear());
	return startYear === EXHIBITION_YEAR ? EXHIBITION_YEAR : startYear;
}

function parseSelectedEntryIds(formData: FormData): number[] {
	const raw = String(formData.get('selectedEntryIds') ?? '').trim();
	if (!raw) return [];

	const parsed = raw
		.split(',')
		.map((part) => Number.parseInt(part.trim(), 10))
		.filter((value) => Number.isFinite(value) && value > 0);

	return [...new Set(parsed)];
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

function buildReturnedRows(rows: OrderSummaryRow[]): ReturnedOrderRow[] {
	const originalOrdersById = new Map<string, OrderSummaryRow>();

	for (const row of rows) {
		if (row.orderKind === 'return') {
			continue;
		}

		if (!originalOrdersById.has(row.orderId)) {
			originalOrdersById.set(row.orderId, row);
		}
	}

	return rows
		.filter(
			(row) =>
				row.orderKind === 'return' &&
				typeof row.sourceOrderId === 'string' &&
				row.sourceOrderId.length > 0 &&
				row.sku.trim() !== 'Not Art'
		)
		.map((row) => ({
			...row,
			returnOrderId: row.orderId,
			sourceOrderId: row.sourceOrderId!,
			originalOrder: originalOrdersById.get(row.sourceOrderId!)
		}));
}

function buildLivePreview(filter: FilterPayload, rows: OrderSummaryRow[], exhibits: Exhibit[]): PreviewPayload {
	const returnedRows = buildReturnedRows(rows);
	const saleRows = rows.filter((row) => row.orderKind !== 'return');
	const { parsedValid, invalidSkuRows, ignoredNotArtRows } = classifyRows(saleRows);
	const { matchedRows, alreadySoldRows, unmatchedRows, ambiguousRows, canceledRows } = matchParsedRows(
		parsedValid,
		exhibits
	);
	const returnedSourceOrderIds = new Set(returnedRows.map((row) => row.sourceOrderId));
	const flaggedMatchedRows = matchedRows.map((row) => ({
		...row,
		potentialReturn: returnedSourceOrderIds.has(row.orderId)
	}));
	const flaggedAlreadySoldRows = alreadySoldRows.map((row) => ({
		...row,
		potentialReturn: returnedSourceOrderIds.has(row.orderId)
	}));
	const totalLineItems = saleRows.length;
	const totalOrders = saleRows.filter((row) => row.orderAmountCents > 0).length;
	const totalReturnedOrders = new Set(returnedRows.map((row) => row.returnOrderId)).size;
	const requestType = filter.rangePreset === 'custom' ? 'custom-range' : 'quick-range';

	return {
		message: `Retrieved ${totalLineItems} sale line items. Matched ${flaggedMatchedRows.length}, canceled ${canceledRows.length}, already sold ${flaggedAlreadySoldRows.length}, unmatched ${unmatchedRows.length}, ambiguous ${ambiguousRows.length}, invalid SKU ${invalidSkuRows.length}, Not Art ${ignoredNotArtRows.length}, Returned ${totalReturnedOrders} orders.`,
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
				matched: flaggedMatchedRows.length,
				canceled: canceledRows.length,
				unmatched: unmatchedRows.length,
				ambiguous: ambiguousRows.length,
				invalidSku: invalidSkuRows.length,
				ignoredNotArt: ignoredNotArtRows.length,
				returned: totalReturnedOrders
			},
			rawOrders: rows,
			matchCandidates: parsedValid,
			invalidSkuRows,
			ignoredNotArtRows,
			matchedRows: flaggedMatchedRows,
			alreadySoldRows: flaggedAlreadySoldRows,
			unmatchedRows,
			ambiguousRows,
			canceledRows,
			returnedRows
		},
		generatedAt: new Date().toISOString()
	};
}

export const load = async () => {
	return {
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
				error: 'Start and end dates are required when using a custom range.',
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
				error: 'A start and end date are required to fetch Square orders.',
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
				error: 'Invalid date format provided. Please choose valid date values.',
				submittedFilter: filter,
				preview: buildPlaceholderPreview(filter)
			});
		}

		const searchRange = toFullDaySearchRange(start, end);

		if (searchRange.start > searchRange.end) {
			await logger.warn('Sales preview rejected: start date is after end date', {
				...logContext,
				startDate: filter.startDate,
				endDate: filter.endDate,
				rangePreset: filter.rangePreset
			});
			return fail(400, {
				error: 'Start date must be before or equal to end date.',
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
		const [squareError, rows] = await checker.getOrderSummaryByDateRange(searchRange.start, searchRange.end);

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

		let preview: PreviewPayload;
		const entryYear = getEntryYearForDate(searchRange.start);
		try {
			const exhibits = await getExhibits({ rows: 999, offset: 0, entryYear });
			preview = buildLivePreview(filter, rows, exhibits);
		} catch (error) {
			await logger.error('Sales preview matching failed while loading exhibits', error as Error, {
				...logContext,
				rangePreset: filter.rangePreset,
				startDate: filter.startDate,
				endDate: filter.endDate,
				entryYear
			});

			return fail(500, {
				error: 'Failed to load exhibit data for matching. Please try again.',
				submittedFilter: filter,
				preview: buildPlaceholderPreview(filter)
			});
		}

		await logger.info('Sales preview fetch completed', {
			...logContext,
			rangePreset: filter.rangePreset,
			startDate: filter.startDate,
			endDate: filter.endDate,
			entryYear,
			totalOrders: preview.sections.summary.totalOrders,
			totalLineItems: preview.sections.summary.totalLineItems,
			matchedRows: preview.sections.matchedRows.length,
			alreadySoldRows: preview.sections.alreadySoldRows.length,
			unmatchedRows: preview.sections.unmatchedRows.length,
			ambiguousRows: preview.sections.ambiguousRows.length
		});

		return {
			submittedFilter: filter,
			preview
		};
	},

	updateSold: async (event: RequestEvent) => {
		const { request } = event;
		const formData = await request.formData();
		const filter = getFilterPayload(formData);
		const selectedEntryIds = parseSelectedEntryIds(formData);
		const { user } = await event.locals.V1safeGetSession();
		const logContext = buildLoggerContext(event, user);

		if (selectedEntryIds.length === 0) {
			return fail(400, {
				error: 'Select at least one matched row before updating sold status.',
				submittedFilter: filter,
				preview: buildPlaceholderPreview(filter)
			});
		}

		if (filter.rangePreset === 'custom' && (!filter.startDate || !filter.endDate)) {
			return fail(400, {
				error: 'Start and end dates are required when using a custom range.',
				submittedFilter: filter,
				preview: buildPlaceholderPreview(filter)
			});
		}

		if (!filter.startDate || !filter.endDate) {
			return fail(400, {
				error: 'A start and end date are required to fetch Square orders.',
				submittedFilter: filter,
				preview: buildPlaceholderPreview(filter)
			});
		}

		const start = parseDateInput(filter.startDate);
		const end = parseDateInput(filter.endDate);

		if (!start || !end) {
			return fail(400, {
				error: 'Invalid date format provided. Please choose valid date values.',
				submittedFilter: filter,
				preview: buildPlaceholderPreview(filter)
			});
		}

		const searchRange = toFullDaySearchRange(start, end);

		if (searchRange.start > searchRange.end) {
			return fail(400, {
				error: 'Start date must be before or equal to end date.',
				submittedFilter: filter,
				preview: buildPlaceholderPreview(filter)
			});
		}

		await logger.info('Sales sold update started', {
			...logContext,
			requestedEntryCount: selectedEntryIds.length,
			rangePreset: filter.rangePreset,
			startDate: filter.startDate,
			endDate: filter.endDate
		});

		const checker = new SquareOrderChecker(SECRET_SQUARE_ACCESS_TOKEN, PUBLIC_SQUARE_ENVIRONMENT);
		const [squareError, rows] = await checker.getOrderSummaryByDateRange(searchRange.start, searchRange.end);

		if (squareError || !rows) {
			const status = squareError?.status ?? 502;
			const message = squareError?.message ?? 'Failed to fetch Square orders for selected range.';

			await logger.error('Sales sold update failed during Square fetch', new Error(message), {
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

		let previewBeforeUpdate: PreviewPayload;
		const entryYear = getEntryYearForDate(searchRange.start);
		try {
			const exhibits = await getExhibits({ rows: 999, offset: 0, entryYear });
			previewBeforeUpdate = buildLivePreview(filter, rows, exhibits);
		} catch (error) {
			await logger.error('Sales sold update failed while loading exhibits', error as Error, {
				...logContext,
				entryYear
			});

			return fail(500, {
				error: 'Failed to load exhibit data for sold update. Please try again.',
				submittedFilter: filter,
				preview: buildPlaceholderPreview(filter)
			});
		}

		const eligibleIds = new Set(previewBeforeUpdate.sections.matchedRows.map((row) => row.matchedEntry.entryId));
		const alreadySoldIds = new Set(previewBeforeUpdate.sections.alreadySoldRows.map((row) => row.matchedEntry.entryId));

		const result: SoldUpdateResult = {
			requested: selectedEntryIds.length,
			updated: 0,
			alreadySold: 0,
			notEligible: 0,
			failed: 0,
			failedEntries: []
		};

		for (const entryId of selectedEntryIds) {
			if (alreadySoldIds.has(entryId)) {
				result.alreadySold += 1;
				continue;
			}

			if (!eligibleIds.has(entryId)) {
				result.notEligible += 1;
				continue;
			}

			try {
				await updateEntry(entryId, { sold: true });
				result.updated += 1;
			} catch (error) {
				result.failed += 1;
				result.failedEntries.push({
					entryId,
					reason: error instanceof Error ? error.message : 'Unknown error'
				});
			}
		}

		let previewAfterUpdate = previewBeforeUpdate;
		if (result.updated > 0) {
			try {
				const refreshedExhibits = await getExhibits({ rows: 999, offset: 0, entryYear });
				previewAfterUpdate = buildLivePreview(filter, rows, refreshedExhibits);
			} catch {
				// keep pre-update preview if refresh fails
			}
		}

		await logger.info('Sales sold update completed', {
			...logContext,
			rangePreset: filter.rangePreset,
			startDate: filter.startDate,
			endDate: filter.endDate,
			entryYear,
			requested: result.requested,
			updated: result.updated,
			alreadySold: result.alreadySold,
			notEligible: result.notEligible,
			failed: result.failed
		});

		return {
			submittedFilter: filter,
			preview: previewAfterUpdate,
			updateResult: result
		};
	}
};
