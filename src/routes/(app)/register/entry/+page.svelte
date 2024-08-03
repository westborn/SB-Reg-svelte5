<script lang="ts">
	import { EntryAccordion, EntryCreateDialog, EntryCreateForm } from '$lib/components';
	import { getStep } from '$lib/regState.svelte.ts';

	import SuperDebug, { type SuperValidated } from 'sveltekit-superforms';
	import type { ReturnedEntries } from '$lib/components/server/registrationDB.js';

	type Props = {
		entryForm: SuperValidated<Record<string, unknown>, any, Record<string, unknown>>;
		entries: ReturnedEntries;
	};

	let { data } = $props();
	let { entries, entryForm } = data;
	let currentEntries = $state(entries);

	let entriesExist = $derived(currentEntries.length > 0);
	let costOfRegistration = $derived(currentEntries ? 20 + currentEntries.length * 20 : 20);
	let numberOfEntries = $derived(
		currentEntries ? (currentEntries.length === 1 ? `1 entry` : `${currentEntries.length} entries`) : 'wtf'
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

<!-- <SuperDebug data={currentEntries} /> -->
<section class="mx-auto mt-10 max-w-prose px-3">
	{#if !entriesExist}
		<div>
			<div class="mb-10 mt-10">Create your first entry</div>
			<EntryCreateForm bind:currentEntries {entryForm} />
		</div>
	{:else}
		<p class="mt-2 text-base font-bold text-primary-400">
			Your registration of {numberOfEntries} has a total fee of ${costOfRegistration}
		</p>
		<div class="mt-6">
			<EntryAccordion bind:currentEntries {doUpdate} {doDelete} />
			<div class="mt-6">
				<EntryCreateDialog bind:currentEntries {entryForm} />
			</div>
		</div>
	{/if}
</section>
