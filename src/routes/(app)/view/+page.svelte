<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';

	import { REGISTRATIONS_OPEN } from '$lib/constants';
	import { getRegisterState, updateSubmission } from '$lib/context.svelte.js';
	import { OptimisedImage } from '$lib/components';
	import { convertToDollars } from '$lib/utils.js';

	let { data } = $props();
	let { submission, user } = data;

	updateSubmission(submission);

	let myState = getRegisterState();

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
	{#if (REGISTRATIONS_OPEN || user.isSuperAdmin) && myState.artistExists}
		<h3 class="text-xl font-bold text-primary">Registration Information</h3>
		<div class="my-3 grid grid-cols-[14ch_1fr] items-center">
			{#each textList as [textItem, textValue]}
				{@render TextList(textItem, textValue)}
			{/each}
		</div>
		{#if myState.entriesExist}
			<p class="mb-6 text-xl text-red-500">
				Your registration of {numberOfEntries} has a total fee of ${costOfRegistration}
				{myState.registrationCompleted ? ' and is complete' : ''}
			</p>

			{#each myState.currentEntries as entryItem, entryKey}
				<Card.Root class="mb-4">
					<Card.Title class="pl-4 pt-4 capitalize">{entryItem.title}</Card.Title>
					<Card.Content class="p-0 pl-4 text-sm">
						<p class="text-xs">({entryItem.inOrOut})</p>
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
	{:else if REGISTRATIONS_OPEN && !myState.artistExists}
		<p class="mt-6 text-red-500">No registration found - please Register</p>
	{:else}
		<h3 class="text-xl font-bold text-red-500">Registration is not available at the moment</h3>
	{/if}
</section>
{#snippet TextList(textItem: string, textValue: string)}
	<p class="text-sm">{textItem}</p>
	<p class="text-sm font-semibold">{textValue}&nbsp</p>
{/snippet}
