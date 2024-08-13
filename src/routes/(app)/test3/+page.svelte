<script lang="ts">
	import { EntryAccordion, EntryCreateDialog, EntryCreateForm } from '$lib/components';
	import { getStep } from '$lib/regState.svelte.ts';

	import SuperDebug, { superForm, type SuperValidated } from 'sveltekit-superforms';
	import type { ReturnedEntries } from '$lib/components/server/registrationDB.js';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { entrySchemaUI } from '../../../lib/zod-schemas.js';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/stores';
	import { getRegisterState, updateSubmission } from '../../../lib/context.svelte.js';

	type Props = {
		entryForm: SuperValidated<Record<string, unknown>, any, Record<string, unknown>>;
		imageUploadForm: SuperValidated<Record<string, unknown>, any, Record<string, unknown>>;
		entries: ReturnedEntries;
	};

	let { data } = $props();
	let { submission, entries, entryForm, imageUploadForm } = data;
	let currentEntries = $state(entries);

	updateSubmission(submission);
	const myState = getRegisterState();

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
	<p class="mt-2 text-base font-bold text-primary-400">
		Your registration of {numberOfEntries} has a total fee of ${costOfRegistration}
	</p>
	<EntryAccordion {currentEntries} {doUpdate} {doDelete} />
	<div class="mt-10">
		<EntryCreateDialog bind:currentEntries {entryForm} {imageUploadForm} />
	</div>
</section>
