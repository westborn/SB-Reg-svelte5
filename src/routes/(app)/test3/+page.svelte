<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { getRegisterState, updateSubmission } from '$lib/context.svelte.js';
	import { OptimisedImage } from '$lib/components';

	import SuperDebug from 'sveltekit-superforms';

	let { data } = $props();
	let { submission } = data;

	updateSubmission(submission);

	let myState = getRegisterState();

	const convertToDollars = (price: number | null | undefined) => {
		if (!price) return '';
		return (price / 100).toLocaleString('en-AU', {
			style: 'currency',
			currency: 'AUD'
		});
	};
</script>

<section class="mx-auto mt-10 max-w-[500px] px-3">
	<h2 class="w-full">H2 here!</h2>
	{#each myState.currentEntries as entryItem, entryKey}
		<Card.Root class="mb-4">
			<Card.Title class="pl-4 pt-4 capitalize">{entryItem.title}</Card.Title>
			<Card.Content class="p-0 pl-4 text-sm">
				<p class="text-xs">({entryItem.inOrOut}){entryItem?.enterMajorPrize ? ' +Major Prize Entry' : ''}</p>
				<p>{entryItem.description}</p>
				<div class="grid grid-cols-2">
					<div class="flex items-center justify-around">
						<OptimisedImage
							path={entryItem?.images?.[0]?.cloudURL
								? entryItem?.images?.[0]?.cloudURL
								: '/dummy_160x160_ffffff_cccccc.png'}
							alt="Current Image"
							width={160}
							height={160}
							class="h-40 w-40 overflow-hidden rounded object-contain"
						/>
					</div>
					<div class="mx-auto flex flex-col">
						<p class="mt-3 text-lg">{convertToDollars(entryItem.price)}</p>
						<p>{entryItem.material}</p>
						<p>{entryItem?.specialRequirements}</p>
						<p>({entryItem.dimensions})</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	{/each}
	<SuperDebug data={myState.currentEntries} />
</section>
