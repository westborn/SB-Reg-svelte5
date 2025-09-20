<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';

	import { getRegisterState } from '$lib/context.svelte.js';
	import { EntryUpdateForm } from '$lib/components';
	import { buttonVariants } from '$lib/components/ui/button/index.js';

	type Props = {
		currentEntryId: number;
	};

	let { currentEntryId }: Props = $props();
	let myState = getRegisterState();

	function handleOpenDialog() {
		myState.openEntryUpdateDialog(currentEntryId);
	}
</script>

<Dialog.Root bind:open={myState.entryUpdateDialogOpen}>
	<Dialog.Trigger class={buttonVariants({ variant: 'outline', size: 'sm' })} onclick={handleOpenDialog}
		><span class="text-xs"> Edit </span></Dialog.Trigger
	>
	<Dialog.Content class="max-h-full max-w-[400px] overflow-y-auto bg-card">
		<Dialog.Header>
			<Dialog.Title>Edit Entry</Dialog.Title>
			<Dialog.Description>Make changes to your entry.<br />Click save when you're done.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<EntryUpdateForm currentEntryId={myState.currentEditingEntryId ?? currentEntryId} />
		</div>
	</Dialog.Content>
</Dialog.Root>
