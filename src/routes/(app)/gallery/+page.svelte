<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { CatalogueCard } from '$lib/components';
	import * as Select from '$lib/components/ui/select';
	import type { Exhibit } from '$lib/components/server/registrationDB.js';

	$effect(() => {
		infiniteScroll({ getData, element });
		// TODO - check that we get more data than the page size for the initial display
		// if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
		// alert("bottom of the page reached"); }
	});

	const { data } = $props();

	let allExhibits: Exhibit[] = $derived($page.data.exhibits?.slice(0, 999) ?? []);

	const pageSize = 3; // Number of items to scroll at a time
	let numToDisplay = $state(10);

	let exhibits = $derived(allExhibits.slice(0, numToDisplay)); // initial page load to be greater than "body" so user can scroll
	// let exhibits = $state(allExhibits); // initial page load to be greater than "body" so user can scroll

	let element = $state();

	const infiniteScroll = ({ getData, element }: { getData: any; element: HTMLElement }) => {
		if (element) {
			const observer = new IntersectionObserver((entries) => {
				const first = entries[0];
				// console.log('getting data', window.innerHeight, first.rootBounds?.top, first.boundingClientRect.top);
				if (first.isIntersecting && exhibits.length < allExhibits.length) {
					getData();
				}
			});
			observer.observe(element);
		}
	};

	const getData = () => {
		if (exhibits.length < allExhibits.length) {
			numToDisplay = exhibits.length + pageSize;
		}
	};

	const years = [
		{ value: '2025', label: '2025' },
		{ value: '2024', label: '2024' },
		{ value: '2023', label: '2023' },
		{ value: '2022', label: '2022' }
	];

	let selectedYear = $state({ value: '2025', label: '2025' });

	function handleSelectYear(event: any) {
		selectedYear = { ...event };
		const newURL = new URL($page.url);
		newURL.searchParams?.set('year', selectedYear.value);
		console.log(newURL.toString());
		goto(newURL);
	}
</script>

<section class="mx-auto mt-2">
	<div class="flex items-center justify-center gap-3">
		<h4 class="text-xl font-bold text-primary">Exhibit Information</h4>
		<Select.Root onSelectedChange={handleSelectYear} selected={selectedYear}>
			<Select.Trigger class="w-[120px]">
				<Select.Value placeholder="Select a year" />
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					<Select.Label>Year</Select.Label>
					{#each years as year}
						<Select.Item value={year.value} label={year.label}>{year.label}</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
			<Select.Input name="entryYear" />
		</Select.Root>
	</div>
</section>

<section class="mx-auto mt-2">
	{#if !exhibits}
		<p>None Found...</p>
	{:else}
		<div>
			<div class="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
				{#each exhibits as exhibit}
					<CatalogueCard {...exhibit} />
				{/each}
			</div>
		</div>
		<div bind:this={element as HTMLDivElement}>
			{exhibits.length == allExhibits.length ? 'No More Exhibits' : 'Loading Exhibits'}.....
		</div>
		<div class="mt-10"></div>
	{/if}
</section>
{#snippet TextList(textItem: string, textValue: string)}
	<p class="text-sm">{textItem}</p>
	<p>{textValue}&nbsp</p>
{/snippet}
