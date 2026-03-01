<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { untrack } from 'svelte';

	let { data, form } = $props();
	const initialFilter = untrack(() => form?.submittedFilter ?? data.filterDefaults);

	let selectedRange = $state(initialFilter.rangePreset);
	let startDate = $state(initialFilter.startDate);
	let endDate = $state(initialFilter.endDate);

	function getMidnight(date: Date): Date {
		const d = new Date(date);
		d.setHours(0, 0, 0, 0);
		return d;
	}

	function toDateTimeLocalString(date: Date): string {
		const pad = (n: number) => String(n).padStart(2, '0');
		const year = date.getFullYear();
		const month = pad(date.getMonth() + 1);
		const day = pad(date.getDate());
		const hours = pad(date.getHours());
		const minutes = pad(date.getMinutes());
		return `${year}-${month}-${day}T${hours}:${minutes}`;
	}

	function formatDisplayDate(date: Date): string {
		return date.toLocaleString('en-AU', {
			year: 'numeric',
			month: 'short',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		});
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
			startLocal: toDateTimeLocalString(start),
			endLocal: toDateTimeLocalString(todayMidnight)
		};
	});

	$effect(() => {
		if (!form?.submittedFilter) return;
		selectedRange = form.submittedFilter.rangePreset;
		startDate = form.submittedFilter.startDate;
		endDate = form.submittedFilter.endDate;
	});

	$effect(() => {
		if (selectedRange !== 'custom') return;
		if (startDate && endDate) return;
		startDate = '2025-03-07T00:00';
		endDate = '2025-03-08T00:00';
	});
</script>

<div class="container mx-auto max-w-5xl space-y-6 px-4 py-8">
	<div>
		<h1 class="text-3xl font-bold">Admin Sales Update</h1>
		<p class="mt-2 text-muted-foreground">
			Phase 1 skeleton: define filter contract and show read-only placeholder output.
		</p>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title>Sales Order Filter</Card.Title>
			<Card.Description>Select a quick range or custom date range.</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" action="?/preview" class="space-y-6">
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
							<Label for="startDate">Start date/time</Label>
							<Input
								id="startDate"
								name="startDate"
								type="datetime-local"
								class="custom-date-input"
								bind:value={startDate}
							/>
						</div>
						<div class="space-y-2">
							<Label for="endDate">End date/time</Label>
							<Input id="endDate" name="endDate" type="datetime-local" class="custom-date-input" bind:value={endDate} />
						</div>
					</div>
				{:else}
					<input type="hidden" name="startDate" value={quickRange?.startLocal ?? ''} />
					<input type="hidden" name="endDate" value={quickRange?.endLocal ?? ''} />
				{/if}

				<div class="flex items-center gap-3">
					<Button type="submit">Preview Sales Orders</Button>
					<p class="text-sm text-muted-foreground">No Square call in Phase 1.</p>
				</div>
			</form>
		</Card.Content>
	</Card.Root>

	{#if form?.error}
		<Card.Root>
			<Card.Content class="pt-6">
				<p class="text-sm font-medium text-red-600">{form.error}</p>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if form?.preview}
		<Card.Root>
			<Card.Header>
				<Card.Title>Preview Response (Phase 1 Placeholder)</Card.Title>
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
