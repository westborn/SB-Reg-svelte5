<script lang="ts">
	import { EntryAccordion, EntryCreateDialog, EntryCreateForm, EntryUpdateButton } from '$lib/components';
	import { getStep } from '$lib/stepsState.svelte';
	import { getRegisterState } from '$lib/context.svelte.js';

	const myState = getRegisterState();

	let costOfRegistration = $derived(myState.currentEntries ? 20 + myState.currentEntries.length * 20 : 20);
	let numberOfEntries = $derived(
		myState.currentEntries
			? myState.currentEntries.length + (myState.currentEntries.length === 1 ? ' entry' : ' entries')
			: ''
	);

	const entryType = {
		create: 'create',
		update: 'update',
		delete: 'delete'
	};

	// default to create a new entry
	let actionType = $state(entryType.create);
	let currentEntryId = $state(0);

	if (!myState.entriesExist) {
		actionType = entryType.create;
	}

	let currentStep = getStep();
	currentStep.step = 1;
</script>

<section class="mx-auto mt-10 px-3">
	{#if actionType === entryType.create}
		{#if !myState.entriesExist}
			<div>
				<div class="mt-10 mb-10">Create your first entry</div>
				<EntryCreateForm />
			</div>
		{:else}
			<p class="text-primary-400 mt-2 text-base font-bold">
				Your registration of {numberOfEntries} has a total fee of ${costOfRegistration}
			</p>
			<div class="mt-6">
				<EntryAccordion />
				<div class="mt-6">
					<EntryCreateDialog />
				</div>
			</div>
		{/if}
	{/if}
	{#if actionType === entryType.update}
		<div>
			<div class="mt-10 mb-10">Update your entry</div>
			<EntryUpdateButton {currentEntryId} />
		</div>
	{/if}
</section>
