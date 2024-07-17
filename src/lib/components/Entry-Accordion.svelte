<script lang="ts">
	import type { Entry, Image } from '$lib/zod-schemas.ts';
	type EntryItem = Entry & { images?: Image[] };
	type EntryArray = EntryItem[];

	type Props = {
		showButtons: boolean;
		doUpdate: (id: number) => void;
		doDelete: (id: number) => void;
		submissionEntries: EntryArray;
	};

	import { Button } from '$lib/components/ui/button';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

	let { showButtons, doUpdate, doDelete, submissionEntries }: Props = $props();

	const convertToDollars = (price: number | null | undefined) => {
		if (!price) return '';
		return (price / 100).toLocaleString('en-AU', {
			style: 'currency',
			currency: 'AUD'
		});
	};
</script>

<Accordion.Root class="w-full">
	{#each submissionEntries as entryDisplayed, entryKey}
		<Accordion.Item value={entryDisplayed.id.toString()}>
			<Accordion.Trigger>Entry {entryKey + 1} - {entryDisplayed.title}</Accordion.Trigger>
			<Accordion.Content>
				<Card.Root>
					<Card.Content class="p-2 text-sm sm:p-6">
						<p class="text-xs">({entryDisplayed.inOrOut})</p>
						<p>{entryDisplayed.description}</p>

						<div class="mx-auto flex items-center justify-between">
							<p class="text-lg">{convertToDollars(entryDisplayed.price)}</p>
							<p class="text-xs">{entryDisplayed?.enterMajorPrize ? 'Major Prize Entry' : ''}</p>
							<p>({entryDisplayed.dimensions})</p>
						</div>

						<p>{entryDisplayed.material}</p>
						<p>{entryDisplayed?.specialRequirements}</p>

						<div class="mx-auto flex h-48 w-48 flex-col items-center justify-center">
							{#if entryDisplayed?.images?.[0]?.cloudURL}
								<img class="h-48 w-48 object-scale-down p-1" src={entryDisplayed?.images[0]?.cloudURL} alt="Preview" />
							{:else}
								<span>Image Preview</span>
							{/if}
						</div>
						<!-- <pre>{JSON.stringify(entryDisplayed, null, 2)}</pre> -->
						{#if showButtons}
							<div class="flex justify-between py-2">
								<Button variant="outline" size="sm" class=" text-sm" onclick={() => doUpdate(entryDisplayed.id)}>
									<span class="text-xs"> Edit </span></Button
								>
								<Button class="bg-red-700" size="sm" onclick={() => doDelete(entryDisplayed.id)}
									><span class="text-xs"> Delete </span>
								</Button>
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			</Accordion.Content>
		</Accordion.Item>
	{/each}
</Accordion.Root>
