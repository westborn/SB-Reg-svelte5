<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';

	import { stillTakingRegistrations } from '$lib/constants';
	import { getRegisterState, updateSubmission } from '$lib/context.svelte.js';
	import { OptimisedImage } from '$lib/components';

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

	let costOfRegistration = $derived(myState.currentEntries ? 20 + myState.currentEntries.length * 20 : 20);
	let numberOfEntries = $derived(
		myState.currentEntries
			? myState.currentEntries.length + (myState.currentEntries.length === 1 ? ' entry' : ' entries')
			: ''
	);

	const textList = $derived([
		['First Name:', myState?.submission?.firstName ?? ''],
		['Surname:', myState?.submission?.lastName ?? ''],
		['Email:', myState?.submission?.email ?? ''],
		['Phone:', myState?.submission?.phone ?? '']
	]);
</script>

<section class="mx-auto mt-2 max-w-[500px] px-3">
	<h4 class="text-xl font-bold text-primary">
		Registration Information
		{#if !stillTakingRegistrations}
			<br /><span class="text-red-500">Registrations are not open at the moment</span>
		{/if}
	</h4>

	{#if myState.artistExists}
		<div class="my-3 grid grid-cols-[14ch_1fr] items-center">
			{#each textList as [textItem, textValue]}
				{@render TextList(textItem, textValue)}
			{/each}
		</div>
		{#if myState.entriesExist}
			<p class="mb-6 text-xl text-red-500">
				Your registration of {numberOfEntries} has a total fee of ${costOfRegistration}
			</p>

			{#each myState.currentEntries as entryItem, entryKey}
				<Card.Root class="mb-4">
					<Card.Title class="pl-4 pt-4 capitalize">{entryItem.title}</Card.Title>
					<Card.Content class="p-0 pl-4 text-sm">
						<p class="text-xs">({entryItem.inOrOut}){entryItem?.enterMajorPrize ? ' +Major Prize Entry' : ''}</p>
						<p>{entryItem.description}</p>
						<div class="grid grid-cols-2">
							<div class="flex items-center justify-around py-2">
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
							<div class="flex flex-col">
								<p class="mt-3 text-lg">{convertToDollars(entryItem.price)}</p>
								<p>{entryItem.material}</p>
								<p>{entryItem?.specialRequirements}</p>
								<p>({entryItem.dimensions})</p>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		{/if}
	{/if}
</section>
{#snippet TextList(textItem: string, textValue: string)}
	<p class="text-sm">{textItem}</p>
	<p>{textValue}&nbsp</p>
{/snippet}
