<script lang="ts">
	import { EntryAccordion, EntryCreateDialog, EntryCreateForm } from '$lib/components';
	import { getStep } from '$lib/regState.svelte.ts';
	import { getRegisterState } from '$lib/context.svelte.js';

	const myState = getRegisterState();

	let costOfRegistration = $derived(myState.currentEntries ? 20 + myState.currentEntries.length * 20 : 20);
	let numberOfEntries = $derived(
		myState.currentEntries
			? myState.currentEntries.length === 1
				? `1 entry`
				: `${myState.currentEntries.length} entries`
			: 'wtf'
	);

	let currentStep = getStep();
	currentStep.step = 1;

	function doUpdate(id: number) {
		console.log('doUpdate for ', id);
	}

	function doDelete(id: number) {
		console.log('doDelete for ', id);
	}
</script>

<section class="mx-auto mt-10 px-3">
	{#if !myState.entriesExist}
		<div>
			<div class="mb-10 mt-10">Create your first entry</div>
			<EntryCreateForm />
		</div>
	{:else}
		<p class="mt-2 text-base font-bold text-primary-400">
			Your registration of {numberOfEntries} has a total fee of ${costOfRegistration}
		</p>
		<div class="mt-6">
			<EntryAccordion {doUpdate} {doDelete} />
			<div class="mt-6">
				<EntryCreateDialog />
			</div>
		</div>
	{/if}
</section>
