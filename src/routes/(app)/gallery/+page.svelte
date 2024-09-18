<script lang="ts">
	import { CatalogueCard } from '$lib/components';

	$effect(() => {
		infiniteScroll({ getData, element });
		// TODO - check that we get more data than the page size for the initial display
		// if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
		// alert("bottom of the page reached"); }
	});

	const { data } = $props();
	const allExhibits = data.exhibits.slice(0, 25);
	let exhibits = $state(allExhibits.slice(0, 15)); // initial page load to be greater than "body" so user can scroll
	// let exhibits = $state(allExhibits); // initial page load to be greater than "body" so user can scroll

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

<section class="mx-auto mt-2 px-3">
	<h4 class="text-xl font-bold text-primary">Exhibit Information</h4>
	{#if !exhibits}
		<p>None Found...</p>
	{:else}
		<div>
			<div class="grid grid-cols-1 gap-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
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
