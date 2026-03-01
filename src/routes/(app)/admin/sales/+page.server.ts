import { fail } from '@sveltejs/kit';
import type { Actions, RequestEvent } from '@sveltejs/kit';
import { SECRET_SQUARE_ACCESS_TOKEN } from '$env/static/private';
import { PUBLIC_SQUARE_ENVIRONMENT } from '$env/static/public';
import SquareOrderChecker, { type OrderSummaryRow } from '$lib/server/squareOrderChecker';
import { logger } from '$lib/server/logger';
import { getExhibits, type Exhibit } from '$lib/components/server/registrationDB';

const SALES_TEST_EXHIBITION_YEAR = '2025';

type RangePreset = '2' | '7' | '10' | 'custom';

type FilterPayload = {
	rangePreset: RangePreset;
	startDate: string;
	endDate: string;
};

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
};

type UnmatchedRow = ClassifiedOrderRow & {
	reason: string;
	candidates: MatchCandidate[];
};

type AmbiguousRow = ClassifiedOrderRow & {
	reason: string;
	candidates: MatchCandidate[];
};

type PreviewPayload = {
	phase: 1 | 2 | 3 | 4;
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
		matchCandidates: ClassifiedOrderRow[];
		parsedValid: ClassifiedOrderRow[];
		invalidSkuRows: InvalidSkuRow[];
		ignoredNotArtRows: OrderSummaryRow[];
		matchedRows: MatchedRow[];
		alreadySoldRows: MatchedRow[];
		unmatchedRows: UnmatchedRow[];
		ambiguousRows: AmbiguousRow[];
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
			matchCandidates: [],
			parsedValid: [],
			invalidSkuRows: [],
			ignoredNotArtRows: [],
			matchedRows: [],
			alreadySoldRows: [],
			unmatchedRows: [],
			ambiguousRows: []
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

	for (const row of parsedValid) {
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
			matchStatus: matchedCandidate.sold ? 'alreadySold' : 'matched'
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
		ambiguousRows
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

function buildLivePreview(filter: FilterPayload, rows: OrderSummaryRow[], exhibits: Exhibit[]): PreviewPayload {
	const { parsedValid, invalidSkuRows, ignoredNotArtRows } = classifyRows(rows);
	const { matchedRows, alreadySoldRows, unmatchedRows, ambiguousRows } = matchParsedRows(parsedValid, exhibits);
	const totalLineItems = rows.length;
	const totalOrders = rows.filter((row) => row.orderAmountCents > 0).length;
	const requestType = filter.rangePreset === 'custom' ? 'custom-range' : 'quick-range';

	return {
		phase: 4,
		status: 'live',
		message: `Retrieved ${totalLineItems} line items. Matched ${matchedRows.length}, already sold ${alreadySoldRows.length}, unmatched ${unmatchedRows.length}, ambiguous ${ambiguousRows.length}, invalid SKU ${invalidSkuRows.length}, ignored Not Art ${ignoredNotArtRows.length}.`,
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
				matched: matchedRows.length,
				unmatched: unmatchedRows.length,
				ambiguous: ambiguousRows.length,
				invalidSku: invalidSkuRows.length,
				ignoredNotArt: ignoredNotArtRows.length
			},
			rawOrders: rows,
			matchCandidates: parsedValid,
			parsedValid,
			invalidSkuRows,
			ignoredNotArtRows,
			matchedRows,
			alreadySoldRows,
			unmatchedRows,
			ambiguousRows
		},
		generatedAt: new Date().toISOString()
	};
}

export const load = async () => {
	return {
		phase: 4,
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

		let preview: PreviewPayload;
		try {
			const exhibits = await getExhibits({ rows: 999, offset: 0, entryYear: SALES_TEST_EXHIBITION_YEAR });
			preview = buildLivePreview(filter, rows, exhibits);
		} catch (error) {
			await logger.error('Sales preview matching failed while loading exhibits', error as Error, {
				...logContext,
				rangePreset: filter.rangePreset,
				startDate: filter.startDate,
				endDate: filter.endDate,
				entryYear: SALES_TEST_EXHIBITION_YEAR
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
	}
};
