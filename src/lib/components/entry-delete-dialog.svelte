<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import { getRegisterState, RegisterState } from '$lib/context.svelte';
	import { entryDeleteSchemaUI } from '$lib/zod-schemas';
	import { toast } from 'svelte-sonner';
	import { cn } from '$lib/utils';

	let myState = getRegisterState();

	// Use the entry ID from global state
	let deletingEntryId = $derived(myState.currentEditingEntryId);

	const form = superForm(myState.entryDeleteForm, {
		validators: zodClient(entryDeleteSchemaUI),
		id: `deleteEntryForm`,
		onResult({ result }: { result: any }) {
			console.log('Action result', result);
			if (result.type != 'success') {
				toast.error('Failed to delete entry');
				myState.entryDeleteDialogOpen = false;
				return;
			}
			myState.submission = result?.data?.updatedSubmission;
			toast.success('Entry Deleted');
			myState.entryDeleteDialogOpen = false;
		}
	});

	const { enhance } = form;
</script>

<AlertDialog.Root bind:open={myState.entryDeleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete Entry</AlertDialog.Title>
			<AlertDialog.Description>Are you sure you want to delete this entry?</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<form method="POST" use:enhance action="?/entryDelete&id={deletingEntryId}">
				<Button class={cn(buttonVariants({ variant: 'destructive' }), 'bg-red-700 hover:bg-red-500')} type="submit"
					>Yes, delete.</Button
				>
			</form>
			<AlertDialog.Cancel
				class={buttonVariants({ variant: 'outline' })}
				onclick={() => (myState.entryDeleteDialogOpen = false)}>No, cancel.</AlertDialog.Cancel
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
