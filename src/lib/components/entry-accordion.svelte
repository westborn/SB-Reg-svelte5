<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import { getRegisterState } from '$lib/context.svelte';
	import { EntryUpdateDialog, EntryDeleteDialog, OptimisedImage, EntryCreateDialog } from '$lib/components';
	import { convertToDollars } from '$lib/utils.js';
	import Star from 'lucide-svelte/icons/star';
	import Images from 'lucide-svelte/icons/images';

	let myState = getRegisterState();

	const showButtons = true;
</script>

<Accordion.Root type="single" class="w-full">
	{#each myState.currentEntries as entryItem, entryKey}
		{@const currentEntryId = myState.currentEntries[entryKey].id}
		<Accordion.Item value={entryItem.id.toString()}>
			<Accordion.Trigger class="flex items-center justify-between">
				<span>{entryItem.title}</span>
				<div class="flex items-center gap-2">
					{#if entryItem.images && entryItem.images.length > 0}
						<Badge variant="secondary" class="text-xs">
							<Images class="mr-1 h-3 w-3" />
							{entryItem.images.length}
							{entryItem.images.length === 1 ? 'image' : 'images'}
						</Badge>
					{/if}
				</div>
			</Accordion.Trigger>
			<Accordion.Content>
				<Card.Root class="mb-4">
					<Card.Title class="pl-4 pt-4 capitalize">{entryItem.title}</Card.Title>
					<Card.Content class="p-0 pl-4 text-sm">
						<p class="text-xs">({entryItem.inOrOut})</p>
						<p>{entryItem.description}</p>
						<div class="grid grid-cols-2">
							<div class="flex items-center justify-around">
								{#if entryItem.primaryImage}
									<!-- Show primary image -->
									<div class="relative">
										<OptimisedImage
											path={entryItem.primaryImage.image.cloudURL}
											alt="Primary Image"
											width={160}
											height={160}
											class="h-40 w-40 overflow-hidden rounded object-cover"
										/>
										<div class="absolute left-2 top-2 rounded-full bg-yellow-500 p-1 text-white">
											<Star class="h-3 w-3 fill-current" />
										</div>
									</div>
								{:else if entryItem.images && entryItem.images.length > 0}
									<!-- Fallback to first image if no primary is set -->
									<OptimisedImage
										path={entryItem.images[0].cloudURL}
										alt="Entry Image"
										width={160}
										height={160}
										class="h-40 w-40 overflow-hidden rounded object-cover"
									/>
								{:else}
									<!-- No image placeholder -->
									<OptimisedImage
										path="/dummy_160x160_ffffff_cccccc.png"
										alt="No Image"
										width={160}
										height={160}
										class="h-40 w-40 overflow-hidden rounded object-contain"
									/>
								{/if}
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
