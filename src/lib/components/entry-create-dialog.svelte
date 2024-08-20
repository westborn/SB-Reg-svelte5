<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { buttonVariants } from '$lib/components/ui/button/index.js';

	import { getRegisterState } from '$lib/context.svelte';
	import { EntryCreateForm } from '$lib/components';

	const myState = getRegisterState();
</script>

<Dialog.Root bind:open={myState.entryCreateDialogOpen}>
	<Dialog.Trigger class={buttonVariants({ variant: 'default' })}>Add a New Entry?</Dialog.Trigger>
	<Dialog.Content class="max-h-full max-w-[600px] overflow-y-auto bg-card">
		<Dialog.Header>
			<Dialog.Title>Create a NEW entry</Dialog.Title>
			<Dialog.Description>Click save when you're done.</Dialog.Description>
		</Dialog.Header>
		<EntryCreateForm />
	</Dialog.Content>
</Dialog.Root>
