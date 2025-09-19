<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import { getRegisterState, RegisterState } from '$lib/context.svelte';
	import { entryDeleteSchemaUI } from '$lib/zod-schemas';
	import { toast } from 'svelte-sonner';
	import { cn } from '$lib/utils';

	type Props = {
		currentEntryId: number;
	};

	let { currentEntryId }: Props = $props();
	let myState = getRegisterState();

	const form = superForm(myState.entryDeleteForm, {
		validators: zodClient(entryDeleteSchemaUI),
		id: `deletePostForm-${currentEntryId}`,
		onResult({ result }: { result: any }) {
			console.log('Action result', result);
			if (result.type != 'success') {
				toast.error('Failed to delete entry');
				myState.entryDeleteDialogOpen = false; //TODO: is this working??
				return;
			}
			myState.submission = result?.data?.updatedSubmission;
			toast.success('Entry Deleted');
			myState.entryDeleteDialogOpen = false; //TODO: is this working??
			return;
		}
	});

	const { form: formData, enhance, message, errors } = form;
</script>

<AlertDialog.Root bind:open={myState.entryDeleteDialogOpen}>
	<AlertDialog.Trigger>
		<Button variant="destructive">Delete</Button>
	</AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete Entry</AlertDialog.Title>
			<AlertDialog.Description>Are you sure you want to delete this entry?</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<form method="POST" use:enhance action="?/entryDelete&id={currentEntryId}">
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
