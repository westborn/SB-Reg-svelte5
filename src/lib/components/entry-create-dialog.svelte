<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { buttonVariants } from '$lib/components/ui/button/index.js';

	import { getRegisterState } from '$lib/context.svelte.js';
	import { EntryCreateForm } from '$lib/components';
	import type { ReturnedEntries } from './server/registrationDB';

	type Props = {
		currentEntries: ReturnedEntries;
	};
	let { currentEntries = $bindable() }: Props = $props();
	let myState = getRegisterState();
</script>

<Dialog.Root bind:open={myState.dialogOpen}>
	<Dialog.Trigger class={buttonVariants({ variant: 'default' })}>Add a New Entry?</Dialog.Trigger>
	<Dialog.Content class="max-h-full max-w-[600px] overflow-y-auto bg-card">
		<Dialog.Header>
			<Dialog.Title>Create a NEW entry</Dialog.Title>
			<Dialog.Description>Click save when you're done.</Dialog.Description>
		</Dialog.Header>
		<EntryCreateForm bind:currentEntries />
	</Dialog.Content>
</Dialog.Root>
