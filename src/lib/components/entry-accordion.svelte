<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import { getRegisterState } from '$lib/context.svelte';
	import { EntryUpdateButton, EntryDeleteButton, EntryCard } from '$lib/components';
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
				<EntryCard {entryItem} variant="accordion" showActions={showButtons}>
					{#snippet children()}
						<EntryUpdateButton {currentEntryId} />
						<EntryDeleteButton {currentEntryId} />
					{/snippet}
				</EntryCard>
			</Accordion.Content>
		</Accordion.Item>
	{/each}
</Accordion.Root>
