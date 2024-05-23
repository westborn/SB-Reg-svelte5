<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { buttonVariants } from '$lib/components/ui/button/index.js';

	import { getRegisterState } from '$lib/state.svelte.js';
	import ArtistUpdateForm from '$lib/components/artist-update-form.svelte';

	let state = getRegisterState();
</script>

<Dialog.Root bind:open={state.dialogOpen}>
	<Dialog.Trigger class={buttonVariants({ variant: 'default' })}>Update Your Details?</Dialog.Trigger>
	<Dialog.Content class="bg-card sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Edit Registration</Dialog.Title>
			<Dialog.Description>Make changes to your profile here.<br />Click save when you're done.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<ArtistUpdateForm />
		</div>
	</Dialog.Content>
</Dialog.Root>
