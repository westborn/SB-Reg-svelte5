<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';

	import { getRegisterState } from '$lib/context.svelte.js';
	import { EntryUpdateForm } from '$lib/components';

	let myState = getRegisterState();

	// No longer need props - use global state for everything
</script>

<Dialog.Root bind:open={myState.entryUpdateDialogOpen}>
	<Dialog.Content class="max-h-full max-w-[400px] overflow-y-auto bg-card">
		<Dialog.Header>
			<Dialog.Title>Edit Entry</Dialog.Title>
			<Dialog.Description>Make changes to your entry.<br />Click save when you're done.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			{#if myState.currentEditingEntryId}
				<EntryUpdateForm currentEntryId={myState.currentEditingEntryId} />
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
