<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';

	import { getRegisterState } from '$lib/state.svelte.js';
	import ArtistCreateForm from '$lib/components/artist-create-form.svelte';

	let state = getRegisterState();
</script>

<Dialog.Root bind:open={state.dialogOpen}>
	<Dialog.Content class="bg-card sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Create a New Registration</Dialog.Title>
			<Dialog.Description>Click save when you're done.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<ArtistCreateForm />
		</div>
	</Dialog.Content>
</Dialog.Root>
