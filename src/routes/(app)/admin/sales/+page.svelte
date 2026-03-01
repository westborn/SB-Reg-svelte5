<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { untrack } from 'svelte';

	type SalesOrderRow = {
		location: string;
		state: string;
		createdDateTime: string | Date;
		orderAmountCents: number;
		orderLine: number;
		item: string;
		sku: string;
		quantity: number;
		baseAmountCents: number;
	};

	type ParsedSkuRow = SalesOrderRow & {
		parsedSku: {
			exhibitNumber: string;
			artistName: string;
			entryId: number;
		};
	};

	type InvalidSkuRow = SalesOrderRow & {
		reason: string;
	};

	type MatchCandidate = {
		entryId: number;
		exhibitNumber: string;
		artistName: string;
		title: string;
		sold: boolean;
	};

	type MatchedRow = ParsedSkuRow & {
		matchedEntry: MatchCandidate;
		matchStatus: 'matched' | 'alreadySold';
	};

	type UnmatchedRow = ParsedSkuRow & {
		reason: string;
		candidates: MatchCandidate[];
	};

	type AmbiguousRow = ParsedSkuRow & {
		reason: string;
		candidates: MatchCandidate[];
	};

	type CanceledRow = ParsedSkuRow & {
		reason: string;
	};

	let { data, form } = $props();
	const initialFilter = untrack(() => form?.submittedFilter ?? data.filterDefaults);

	let selectedRange = $state(initialFilter.rangePreset);
	let startDate = $state(initialFilter.startDate);
	let endDate = $state(initialFilter.endDate);
	let isPreviewSubmitting = $state(false);
	let isUpdateSubmitting = $state(false);

	function getMidnight(date: Date): Date {
		const d = new Date(date);
		d.setHours(0, 0, 0, 0);
		return d;
	}

	function toDateInputString(date: Date): string {
		const pad = (n: number) => String(n).padStart(2, '0');
		const year = date.getFullYear();
		const month = pad(date.getMonth() + 1);
		const day = pad(date.getDate());
		return `${year}-${month}-${day}`;
	}

	function getDefaultCustomRange() {
		const today = getMidnight(new Date());
		const start = new Date(today);
		start.setDate(start.getDate() - 7);
		return {
			startDate: toDateInputString(start),
			endDate: toDateInputString(today)
		};
	}

	function formatDisplayDate(date: Date): string {
		return date.toLocaleDateString('en-AU', {
			year: 'numeric',
			month: 'short',
			day: '2-digit'
		});
	}

	function formatFromISO(value: string | Date): string {
		const date = typeof value === 'string' ? new Date(value) : value;
		if (Number.isNaN(date.getTime())) return '-';
		return formatDisplayDate(date);
	}

	function formatDollars(cents: number): string {
		if (!Number.isFinite(cents)) return '$0.00';
		return `$${(cents / 100).toFixed(2)}`;
	}

	const quickRange = $derived.by(() => {
		if (selectedRange === 'custom') {
			return null;
		}

		const days = Number(selectedRange);
		const todayMidnight = getMidnight(new Date());
		const start = new Date(todayMidnight);
		start.setDate(start.getDate() - days);

		return {
			start,
			end: todayMidnight,
			startDate: toDateInputString(start),
			endDate: toDateInputString(todayMidnight)
		};
	});

	const rawOrderRows = $derived((form?.preview?.sections?.rawOrders ?? []) as SalesOrderRow[]);
	const parsedValidRows = $derived((form?.preview?.sections?.parsedValid ?? []) as ParsedSkuRow[]);
	const invalidSkuRows = $derived((form?.preview?.sections?.invalidSkuRows ?? []) as InvalidSkuRow[]);
	const ignoredNotArtRows = $derived((form?.preview?.sections?.ignoredNotArtRows ?? []) as SalesOrderRow[]);
	const matchedRows = $derived(((form as any)?.preview?.sections?.matchedRows ?? []) as MatchedRow[]);
	const alreadySoldRows = $derived(((form as any)?.preview?.sections?.alreadySoldRows ?? []) as MatchedRow[]);
	const unmatchedRows = $derived(((form as any)?.preview?.sections?.unmatchedRows ?? []) as UnmatchedRow[]);
	const ambiguousRows = $derived(((form as any)?.preview?.sections?.ambiguousRows ?? []) as AmbiguousRow[]);
	const canceledRows = $derived(((form as any)?.preview?.sections?.canceledRows ?? []) as CanceledRow[]);
	const updateResult = $derived(
		((form as any)?.updateResult ?? null) as {
			requested: number;
			updated: number;
			alreadySold: number;
			notEligible: number;
			failed: number;
			failedEntries: Array<{ entryId: number; reason: string }>;
		} | null
	);

	let selectedEntryIds = $state<number[]>([]);

	function toggleSelectedEntry(entryId: number, checked: boolean) {
		if (checked) {
			if (!selectedEntryIds.includes(entryId)) {
				selectedEntryIds = [...selectedEntryIds, entryId];
			}
			return;
		}
		selectedEntryIds = selectedEntryIds.filter((id) => id !== entryId);
	}

	function isEntrySelected(entryId: number): boolean {
		return selectedEntryIds.includes(entryId);
	}

	function selectAllMatchedRows() {
		selectedEntryIds = [...new Set(matchedRows.map((row) => row.matchedEntry.entryId))];
	}

	function clearSelectedRows() {
		selectedEntryIds = [];
	}

	function handlePreviewSubmit() {
		isPreviewSubmitting = true;
	}

	function handleUpdateSubmit(event: SubmitEvent) {
		if (selectedEntryIds.length === 0) {
			event.preventDefault();
			return;
		}

		const label = selectedEntryIds.length === 1 ? 'entry' : 'entries';
		const confirmed = window.confirm(
			`Set sold = true for ${selectedEntryIds.length} selected ${label}? This action is not reversible on this screen.`
		);

		if (!confirmed) {
			event.preventDefault();
			return;
		}

		isUpdateSubmitting = true;
	}

	$effect(() => {
		if (!form?.submittedFilter) return;
		selectedRange = form.submittedFilter.rangePreset;
		startDate = form.submittedFilter.startDate;
		endDate = form.submittedFilter.endDate;
	});

	$effect(() => {
		if (selectedRange !== 'custom') return;
		if (startDate && endDate) return;
		const defaults = getDefaultCustomRange();
		startDate = defaults.startDate;
		endDate = defaults.endDate;
	});

	$effect(() => {
		if (!form?.preview) return;
		const validMatchedEntryIds = new Set(matchedRows.map((row) => row.matchedEntry.entryId));
		const filteredSelection = selectedEntryIds.filter((entryId) => validMatchedEntryIds.has(entryId));
		const unchanged =
			filteredSelection.length === selectedEntryIds.length &&
			filteredSelection.every((entryId, index) => entryId === selectedEntryIds[index]);

		if (!unchanged) {
			selectedEntryIds = filteredSelection;
		}
	});
</script>

<div class="container mx-auto max-w-5xl space-y-6 px-4 py-8">
	<div>
		<h1 class="text-3xl font-bold">Admin Sales Update</h1>
		<p class="mt-2 text-muted-foreground">Phase 6: review matches, confirm updates, and mark sold entries safely.</p>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title>Sales Order Filter</Card.Title>
			<Card.Description>Select a quick range or custom date range.</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" action="?/preview" class="space-y-6" onsubmit={handlePreviewSubmit}>
				<div class="space-y-3">
					<Label>Quick range</Label>
					<RadioGroup.Root name="rangePreset" bind:value={selectedRange} class="grid gap-3 md:grid-cols-4">
						<div class="flex items-center gap-2">
							<RadioGroup.Item id="range-2" value="2" />
							<Label for="range-2">Last 2 days</Label>
						</div>
						<div class="flex items-center gap-2">
							<RadioGroup.Item id="range-7" value="7" />
							<Label for="range-7">Last 7 days</Label>
						</div>
						<div class="flex items-center gap-2">
							<RadioGroup.Item id="range-10" value="10" />
							<Label for="range-10">Last 10 days</Label>
						</div>
						<div class="flex items-center gap-2">
							<RadioGroup.Item id="range-custom" value="custom" />
							<Label for="range-custom">Custom range</Label>
						</div>
					</RadioGroup.Root>
				</div>

				{#if quickRange}
					<div class="rounded-md border border-border bg-muted/40 p-3 text-sm">
						<p class="font-medium">Calculated range</p>
						<p class="text-muted-foreground">
							{formatDisplayDate(quickRange.start)} → {formatDisplayDate(quickRange.end)}
						</p>
					</div>
				{/if}

				{#if selectedRange === 'custom'}
					<div class="grid gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label for="startDate">Start date</Label>
							<Input id="startDate" name="startDate" type="date" class="custom-date-input" bind:value={startDate} />
						</div>
						<div class="space-y-2">
							<Label for="endDate">End date</Label>
							<Input id="endDate" name="endDate" type="date" class="custom-date-input" bind:value={endDate} />
						</div>
					</div>
				{:else}
					<input type="hidden" name="startDate" value={quickRange?.startDate ?? ''} />
					<input type="hidden" name="endDate" value={quickRange?.endDate ?? ''} />
				{/if}

				<div class="flex items-center gap-3">
					<Button type="submit" disabled={isPreviewSubmitting}>
						{isPreviewSubmitting ? 'Loading Preview…' : 'Preview Sales Orders'}
					</Button>
					<p class="text-sm text-muted-foreground">Fetch and classify Square rows (no DB updates in this step).</p>
				</div>
			</form>
		</Card.Content>
	</Card.Root>

	{#if !form?.preview && !form?.error}
		<Card.Root>
			<Card.Content class="pt-6">
				<p class="text-sm text-muted-foreground">
					Choose a date range, then preview Square order rows to see matched, unmatched, and excluded results.
				</p>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if form?.error}
		<Card.Root>
			<Card.Content class="pt-6">
				<p class="text-sm font-medium text-red-600">{form.error}</p>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if updateResult}
		<Card.Root>
			<Card.Header>
				<Card.Title>Sold Update Result</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-2 text-sm">
				<p><span class="font-semibold">Requested:</span> {updateResult.requested}</p>
				<p><span class="font-semibold">Updated:</span> {updateResult.updated}</p>
				<p><span class="font-semibold">Already sold:</span> {updateResult.alreadySold}</p>
				<p><span class="font-semibold">Not eligible:</span> {updateResult.notEligible}</p>
				<p><span class="font-semibold">Failed:</span> {updateResult.failed}</p>
				{#if updateResult.failedEntries.length > 0}
					<div class="pt-2">
						<p class="font-semibold text-red-600">Failed entries</p>
						<ul class="list-inside list-disc text-red-600">
							{#each updateResult.failedEntries as failed}
								<li>Entry {failed.entryId}: {failed.reason}</li>
							{/each}
						</ul>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}

	{#if form?.preview}
		<Card.Root>
			<Card.Header>
				<Card.Title>Preview Response</Card.Title>
				<Card.Description>{form.preview.message}</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-3">
				<p class="text-sm">
					<span class="font-semibold">Request type:</span>
					{form.preview.request.type}
				</p>
				<p class="text-sm">
					<span class="font-semibold">Range preset:</span>
					{form.preview.request.rangePreset}
				</p>
				{#if form.preview.request.startDate || form.preview.request.endDate}
					<p class="text-sm">
						<span class="font-semibold">Range:</span>
						{form.preview.request.startDate} → {form.preview.request.endDate}
					</p>
				{/if}
				<p class="text-sm">
					<span class="font-semibold">Status:</span>
					{form.preview.status}
				</p>
				<div class="grid gap-3 pt-2 md:grid-cols-2 lg:grid-cols-4">
					<div class="rounded border p-3">
						<p class="text-xs text-muted-foreground">Orders</p>
						<p class="text-xl font-semibold">{form.preview.sections.summary.totalOrders}</p>
					</div>
					<div class="rounded border p-3">
						<p class="text-xs text-muted-foreground">Line Items</p>
						<p class="text-xl font-semibold">{form.preview.sections.summary.totalLineItems}</p>
					</div>
					<div class="rounded border p-3">
						<p class="text-xs text-muted-foreground">Matched</p>
						<p class="text-xl font-semibold">{form.preview.sections.summary.matched}</p>
					</div>
					<div class="rounded border border-red-200 bg-red-50 p-3">
						<p class="text-xs text-red-700">Canceled (Excluded)</p>
						<p class="text-xl font-semibold text-red-700">{(form as any).preview.sections.summary.canceled ?? 0}</p>
					</div>
					<div class="rounded border p-3">
						<p class="text-xs text-muted-foreground">Already Sold</p>
						<p class="text-xl font-semibold">{alreadySoldRows.length}</p>
					</div>
					<div class="rounded border p-3">
						<p class="text-xs text-muted-foreground">Unmatched</p>
						<p class="text-xl font-semibold">{form.preview.sections.summary.unmatched}</p>
					</div>
					<div class="rounded border p-3">
						<p class="text-xs text-muted-foreground">Ambiguous</p>
						<p class="text-xl font-semibold">{form.preview.sections.summary.ambiguous}</p>
					</div>
					<div class="rounded border p-3">
						<p class="text-xs text-muted-foreground">Ignored Not Art</p>
						<p class="text-xl font-semibold">{form.preview.sections.summary.ignoredNotArt}</p>
					</div>
					<div class="rounded border p-3">
						<p class="text-xs text-muted-foreground">Invalid SKU</p>
						<p class="text-xl font-semibold">{form.preview.sections.summary.invalidSku}</p>
					</div>
				</div>

				{#if rawOrderRows.length === 0}
					<p class="pt-2 text-sm text-muted-foreground">No order rows were returned for this date range.</p>
				{/if}

				{#if rawOrderRows.length > 0}
					<p class="pt-2 text-sm font-semibold">All Order Rows</p>
					<div class="overflow-x-auto pt-2">
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head class="whitespace-nowrap">Created</Table.Head>
									<Table.Head>Location</Table.Head>
									<Table.Head>State</Table.Head>
									<Table.Head>Line</Table.Head>
									<Table.Head>Item</Table.Head>
									<Table.Head>SKU</Table.Head>
									<Table.Head>Qty</Table.Head>
									<Table.Head class="text-right">Line Amount</Table.Head>
									<Table.Head class="text-right">Order Amount</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each rawOrderRows as row}
									<Table.Row class={row.state === 'CANCELLED' ? 'bg-red-50 text-red-700' : ''}>
										<Table.Cell class="whitespace-nowrap">{formatFromISO(row.createdDateTime)}</Table.Cell>
										<Table.Cell>{row.location}</Table.Cell>
										<Table.Cell>{row.state}</Table.Cell>
										<Table.Cell>{row.orderLine}</Table.Cell>
										<Table.Cell>{row.item}</Table.Cell>
										<Table.Cell>{row.sku}</Table.Cell>
										<Table.Cell>{row.quantity}</Table.Cell>
										<Table.Cell class="text-right">{formatDollars(row.baseAmountCents)}</Table.Cell>
										<Table.Cell class="text-right">{formatDollars(row.orderAmountCents)}</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</div>
				{/if}

				{#if matchedRows.length > 0}
					<p class="pt-4 text-sm font-semibold">Matched Rows (Ready for sold update in Phase 5)</p>
					<div class="flex items-center gap-2 pt-1">
						<Button type="button" variant="outline" size="sm" onclick={selectAllMatchedRows}>Select all</Button>
						<Button type="button" variant="outline" size="sm" onclick={clearSelectedRows}>Clear selection</Button>
						<span class="text-xs text-muted-foreground">{selectedEntryIds.length} selected</span>
					</div>
					<div class="overflow-x-auto pt-2">
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>Select</Table.Head>
									<Table.Head>SKU</Table.Head>
									<Table.Head>Entry Id</Table.Head>
									<Table.Head>Exhibit Number</Table.Head>
									<Table.Head>Artist</Table.Head>
									<Table.Head>Title</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each matchedRows as row}
									<Table.Row>
										<Table.Cell>
											<input
												type="checkbox"
												checked={isEntrySelected(row.matchedEntry.entryId)}
												onchange={(e) => toggleSelectedEntry(row.matchedEntry.entryId, e.currentTarget.checked)}
											/>
										</Table.Cell>
										<Table.Cell>{row.sku}</Table.Cell>
										<Table.Cell>{row.matchedEntry.entryId}</Table.Cell>
										<Table.Cell>{row.matchedEntry.exhibitNumber}</Table.Cell>
										<Table.Cell>{row.matchedEntry.artistName}</Table.Cell>
										<Table.Cell>{row.matchedEntry.title}</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</div>

					<form method="POST" action="?/updateSold" class="mt-3 space-y-2" onsubmit={handleUpdateSubmit}>
						<input type="hidden" name="rangePreset" value={form.preview.request.rangePreset} />
						<input type="hidden" name="startDate" value={form.preview.request.startDate} />
						<input type="hidden" name="endDate" value={form.preview.request.endDate} />
						<input type="hidden" name="selectedEntryIds" value={selectedEntryIds.join(',')} />
						<div class="flex items-center gap-3">
							<Button type="submit" disabled={selectedEntryIds.length === 0 || isUpdateSubmitting}
								>{isUpdateSubmitting ? 'Updating Sold Status…' : 'Update sold status for selected rows'}</Button
							>
							<p class="text-xs text-muted-foreground">
								Server revalidates eligible matches before writing. You will be asked to confirm before submit.
							</p>
						</div>
					</form>
				{/if}

				{#if form.preview.sections.summary.totalLineItems > 0 && matchedRows.length === 0}
					<p class="pt-4 text-sm text-muted-foreground">
						No rows are currently eligible for sold updates in this result set.
					</p>
				{/if}

				{#if canceledRows.length > 0}
					<p class="pt-4 text-sm font-semibold text-red-700">Canceled Rows (Excluded from updates)</p>
					<div class="overflow-x-auto pt-2">
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>SKU</Table.Head>
									<Table.Head>Entry Id</Table.Head>
									<Table.Head>State</Table.Head>
									<Table.Head>Reason</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each canceledRows as row}
									<Table.Row class="bg-red-50 text-red-700">
										<Table.Cell>{row.sku}</Table.Cell>
										<Table.Cell>{row.parsedSku.entryId}</Table.Cell>
										<Table.Cell>{row.state}</Table.Cell>
										<Table.Cell>{row.reason}</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</div>
				{/if}

				{#if alreadySoldRows.length > 0}
					<p class="pt-4 text-sm font-semibold">Already Sold Rows (Excluded)</p>
					<div class="overflow-x-auto pt-2">
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>SKU</Table.Head>
									<Table.Head>Entry Id</Table.Head>
									<Table.Head>Title</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each alreadySoldRows as row}
									<Table.Row>
										<Table.Cell>{row.sku}</Table.Cell>
										<Table.Cell>{row.matchedEntry.entryId}</Table.Cell>
										<Table.Cell>{row.matchedEntry.title}</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</div>
				{/if}

				{#if unmatchedRows.length > 0}
					<p class="pt-4 text-sm font-semibold">Unmatched Rows</p>
					<div class="overflow-x-auto pt-2">
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>SKU</Table.Head>
									<Table.Head>Reason</Table.Head>
									<Table.Head>Candidates</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each unmatchedRows as row}
									<Table.Row>
										<Table.Cell>{row.sku}</Table.Cell>
										<Table.Cell>{row.reason}</Table.Cell>
										<Table.Cell>{row.candidates.length}</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</div>
				{/if}

				{#if ambiguousRows.length > 0}
					<p class="pt-4 text-sm font-semibold">Ambiguous Rows</p>
					<div class="overflow-x-auto pt-2">
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>SKU</Table.Head>
									<Table.Head>Reason</Table.Head>
									<Table.Head>Candidates</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each ambiguousRows as row}
									<Table.Row>
										<Table.Cell>{row.sku}</Table.Cell>
										<Table.Cell>{row.reason}</Table.Cell>
										<Table.Cell>{row.candidates.length}</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</div>
				{/if}

				{#if parsedValidRows.length > 0}
					<p class="pt-4 text-sm font-semibold">Parsed Valid SKU Rows</p>
					<div class="overflow-x-auto pt-2">
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>SKU</Table.Head>
									<Table.Head>Exhibit Number</Table.Head>
									<Table.Head>Artist Name</Table.Head>
									<Table.Head>Entry Id</Table.Head>
									<Table.Head>Item</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each parsedValidRows as row}
									<Table.Row>
										<Table.Cell>{row.sku}</Table.Cell>
										<Table.Cell>{row.parsedSku.exhibitNumber}</Table.Cell>
										<Table.Cell>{row.parsedSku.artistName}</Table.Cell>
										<Table.Cell>{row.parsedSku.entryId}</Table.Cell>
										<Table.Cell>{row.item}</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</div>
				{/if}

				{#if invalidSkuRows.length > 0}
					<p class="pt-4 text-sm font-semibold">Invalid SKU Rows</p>
					<div class="overflow-x-auto pt-2">
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>SKU</Table.Head>
									<Table.Head>Reason</Table.Head>
									<Table.Head>Item</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each invalidSkuRows as row}
									<Table.Row>
										<Table.Cell>{row.sku}</Table.Cell>
										<Table.Cell>{row.reason}</Table.Cell>
										<Table.Cell>{row.item}</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</div>
				{/if}

				{#if ignoredNotArtRows.length > 0}
					<p class="pt-4 text-sm font-semibold">Ignored Not Art Rows</p>
					<div class="overflow-x-auto pt-2">
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>SKU</Table.Head>
									<Table.Head>Item</Table.Head>
									<Table.Head>Location</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each ignoredNotArtRows as row}
									<Table.Row>
										<Table.Cell>{row.sku}</Table.Cell>
										<Table.Cell>{row.item}</Table.Cell>
										<Table.Cell>{row.location}</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</div>
				{/if}

				<p class="text-sm text-muted-foreground">Generated at: {form.preview.generatedAt}</p>
			</Card.Content>
		</Card.Root>
	{/if}
</div>

<style>
	:global(.custom-date-input::-webkit-calendar-picker-indicator) {
		opacity: 1;
		filter: brightness(0.2) contrast(1.6);
		transform: scale(1.35);
		cursor: pointer;
	}
</style>
