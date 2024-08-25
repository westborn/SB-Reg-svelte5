<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { buttonVariants } from '$lib/components/ui/button/index.js';

	import { getRegisterState } from '$lib/context.svelte.js';
	import { ConfirmForm } from '$lib/components';

	let myState = getRegisterState();

	const completedBankDetails = $derived(
		myState?.submission?.bankAccountName && myState?.submission?.bankBSB && myState?.submission?.bankAccount
			? true
			: false
	);
</script>

<Dialog.Root bind:open={myState.confirmDialogOpen}>
	{#if !completedBankDetails}
		<Dialog.Trigger class={buttonVariants({ variant: 'destructive' })}>Enter Bank Details!</Dialog.Trigger>
	{:else}
		<Dialog.Trigger class={buttonVariants({ variant: 'default' })}>Update these Details?</Dialog.Trigger>
	{/if}
	<Dialog.Content class="max-h-full max-w-[400px] overflow-y-auto bg-card">
		<Dialog.Header>
			<Dialog.Title>Exhibition Confirmation</Dialog.Title>
			<Dialog.Description>Make changes to your details here.<br />Click save when you're done.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<ConfirmForm />
		</div>
	</Dialog.Content>
</Dialog.Root>
