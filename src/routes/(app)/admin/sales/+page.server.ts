import { fail } from '@sveltejs/kit';
import type { Actions, RequestEvent } from '@sveltejs/kit';

type RangePreset = '2' | '7' | '10' | 'custom';

type FilterPayload = {
	rangePreset: RangePreset;
	startDate: string;
	endDate: string;
};

type PreviewPayload = {
	phase: number;
	status: 'placeholder';
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
		rawOrders: unknown[];
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

export const load = async () => {
	return {
		phase: 1,
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
	preview: async ({ request }: RequestEvent) => {
		const formData = await request.formData();
		const filter = getFilterPayload(formData);

		if (filter.rangePreset === 'custom' && (!filter.startDate || !filter.endDate)) {
			return fail(400, {
				error: 'Start and end date/time are required when using a custom range.',
				submittedFilter: filter,
				preview: buildPlaceholderPreview(filter)
			});
		}

		return {
			submittedFilter: filter,
			preview: buildPlaceholderPreview(filter)
		};
	}
};
