<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { getRegisterState } from '$lib/context.svelte';

	type Props = {
		doUpdate: (id: number) => void;
		doDelete: (id: number) => void;
	};
	let { doUpdate, doDelete }: Props = $props();

	let myState = getRegisterState();

	const convertToDollars = (price: number | null | undefined) => {
		if (!price) return '';
		return (price / 100).toLocaleString('en-AU', {
			style: 'currency',
			currency: 'AUD'
		});
	};
	const showButtons = true;
</script>

<Accordion.Root class="w-full">
	{#each myState.currentEntries as entryItem, entryKey}
		<Accordion.Item value={entryItem.id.toString()}>
			<Accordion.Trigger>Entry {entryKey + 1} - {entryItem.title}</Accordion.Trigger>
			<Accordion.Content>
				<Card.Root>
					<Card.Content class="p-2 text-sm sm:p-6">
						<p class="text-xs">({entryItem.inOrOut})</p>
						<p>{entryItem.description}</p>

						<div class="mx-auto flex items-center justify-between">
							<p class="text-lg">{convertToDollars(entryItem.price)}</p>
							<p class="text-xs">{entryItem?.enterMajorPrize ? 'Major Prize Entry' : ''}</p>
							<p>({entryItem.dimensions})</p>
						</div>

						<p>{entryItem.material}</p>
						<p>{entryItem?.specialRequirements}</p>

						<div class="mx-auto flex h-48 w-48 flex-col items-center justify-center">
							{#if entryItem?.images?.[0]?.cloudURL}
								<img class="h-48 w-48 object-scale-down p-1" src={entryItem?.images[0]?.cloudURL} alt="Preview" />
							{:else}
								<span>Image Preview</span>
							{/if}
						</div>
						<!-- <pre>{JSON.stringify(entryItem, null, 2)}</pre> -->
						{#if showButtons}
							<div class="flex justify-between py-2">
								<Button variant="outline" size="sm" class=" text-sm" onclick={() => doUpdate(entryItem.id)}>
									<span class="text-xs"> Edit </span></Button
								>
								<Button class="bg-red-700" size="sm" onclick={() => doDelete(entryItem.id)}
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
