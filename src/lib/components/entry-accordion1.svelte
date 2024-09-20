<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { getRegisterState } from '$lib/context.svelte';
	import { EntryUpdateDialog, EntryDeleteDialog, OptimisedImage, EntryCreateDialog } from '$lib/components';
	import { convertToDollars } from '$lib/utils.js';

	let myState = getRegisterState();

	const showButtons = true;
</script>

<Accordion.Root class="w-full">
	{#each myState.currentEntries as entryItem, entryKey}
		{@const currentEntryId = myState.currentEntries[entryKey].id}
		<Accordion.Item value={entryItem.id.toString()}>
			<Accordion.Trigger>Entry {entryKey + 1} - {entryItem.title}</Accordion.Trigger>
			<Accordion.Content>
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
						<!-- <pre>{JSON.stringify(entryItem, null, 2)}</pre> -->
						{#if showButtons}
							<div class="flex justify-around py-2">
								<EntryUpdateDialog {currentEntryId} />
								<EntryDeleteDialog {currentEntryId} />
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			</Accordion.Content>
		</Accordion.Item>
	{/each}
</Accordion.Root>
