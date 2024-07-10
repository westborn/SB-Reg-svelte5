<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { buttonVariants } from '$lib/components/ui/button/index.js';

	import { getRegisterState } from '$lib/context.svelte.js';
	import { ArtistCreateForm } from '$lib/components';

	let myState = getRegisterState();

	let { artistForm }: { artistForm: SuperValidated<Record<string, unknown>, any, Record<string, unknown>> } = $props();
</script>

<Dialog.Root bind:open={myState.dialogOpen}>
	<Dialog.Trigger class={buttonVariants({ variant: 'default' })}>Create your Artist Profile?</Dialog.Trigger>
	<Dialog.Content class="max-h-full max-w-[400px] overflow-y-auto bg-card">
		<Dialog.Header>
			<Dialog.Title>Create a New Registration</Dialog.Title>
			<Dialog.Description>Click save when you're done.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<ArtistCreateForm {artistForm} />
		</div>
	</Dialog.Content>
</Dialog.Root>
