<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { buttonVariants } from '$lib/components/ui/button/index.js';

	import { getRegisterState, setRegisterState } from '$lib/state.svelte.js';
	import ArtistCreateForm from '$lib/components/artist-create-form.svelte';

	let state = getRegisterState();
</script>

<Dialog.Root bind:open={state.createOpen}>
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
