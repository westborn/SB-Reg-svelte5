<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { CatalogueCard } from '$lib/components';
	import * as Select from '$lib/components/ui/select';
	import { EXHIBITION_YEAR } from '$lib/constants';
	import type { Exhibit } from '$lib/components/server/registrationDB.js';

	$effect(() => {
		infiniteScroll({ getData, element });
		// TODO - check that we get more data than the page size for the initial display
		// if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
		// alert("bottom of the page reached"); }
	});

	const { data } = $props();

	let allExhibits: Exhibit[] = $derived(page.data.exhibits?.slice(0, 999) ?? []);

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

	const years = ['2026', '2025', '2024', '2023', '2022'];

	let selectedYear = $state(EXHIBITION_YEAR);

	function handleSelectYear(event: any) {
		selectedYear = { ...event };
		const newURL = new URL(page.url);
		newURL.searchParams?.set('year', selectedYear);
		console.log(newURL.toString());
		goto(newURL);
	}
</script>

<section class="mx-auto mt-2">
	<div class="flex items-center justify-center gap-3">
		<h4 class="text-xl font-bold text-primary">Exhibit Information</h4>
		<Select.Root type="single" bind:value={selectedYear} name="entryYear">
			<Select.Trigger class="w-[120px]">Select a year</Select.Trigger>
			<Select.Content>
				{#each years as year}
					<Select.Item value={year}>{year}</Select.Item>
				{/each}
			</Select.Content>
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
