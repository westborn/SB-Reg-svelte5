<script lang="ts">
	import { OptimisedImage } from '$lib/components';
	import type { Exhibits } from '$lib/components/server/registrationDB.js';
	import { convertToDollars } from '$lib/utils.js';

	$effect(() => {
		infiniteScroll({ getData, element });
		// TODO - check that we get more data than the page size for the initial display
		// if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
		// alert("bottom of the page reached"); }
	});

	const { data } = $props();
	const allExhibits = data.exhibits as Exhibits[];
	let exhibits = $state(allExhibits.slice(0, 5)); // initial page load to be greater than "body" so user can scroll

	const pageSize = 3; // Number of items to scroll at a time
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
			const end = exhibits.length + pageSize;
			exhibits = [...allExhibits.slice(0, end)];
		}
	};
</script>

<section class="mx-auto mt-2 max-w-[600px] px-3">
	<h4 class="text-xl font-bold text-primary">Exhibit Information</h4>
	{#if !exhibits}
		<p>None Found...</p>
	{:else}
		<div>
			{#each exhibits as exhibit}
				<div class="my-3 grid grid-cols-[14ch_1fr] items-center">
					{@render TextList('Email:', exhibit.email)}
					{@render TextList('Name:', exhibit.artistName)}
					{@render TextList('Price:', convertToDollars(exhibit.price))}

					<div>
						<OptimisedImage
							path={exhibit.cloudURL ? exhibit.cloudURL : '/dummy_160x160_ffffff_cccccc.png'}
							alt="Current Image"
							width={128}
							height={128}
							class="h-32 w-32 overflow-hidden rounded object-contain"
						/>
					</div>
					{@render TextList('', exhibit.exhibitNumber)}
				</div>
			{/each}
			<div bind:this={element as HTMLDivElement}>
				{exhibits.length == allExhibits.length ? 'No More Exhibits' : 'Loading Exhibits'}.....
			</div>
		</div>
		<div class="mt-10"></div>
	{/if}
</section>
{#snippet TextList(textItem: string, textValue: string)}
	<p class="text-sm">{textItem}</p>
	<p>{textValue}&nbsp</p>
{/snippet}
