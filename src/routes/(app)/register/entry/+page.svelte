<script lang="ts">
	import { EntryAccordion, EntryCreateDialog, EntryCreateForm } from '$lib/components';
	import SuperDebug from 'sveltekit-superforms';
	import type { ReturnedEntries } from '$lib/components/server/registrationDB.ts';
	// TODO fix this type!

	let { data } = $props();
	let { currentEntries, entryForm } = data;

	// console.log('currentEntries', JSON.stringify(currentEntries, null, 2));

	let entryArray = (
		currentEntries && currentEntries.registrations.length > 0 ? currentEntries.registrations[0].entries : []
	) as ReturnedEntries;

	let entriesExist = entryArray.length > 0;

	let showButtons = true;

	let costOfRegistration = entryArray ? 20 + entryArray.length * 20 : 20;
	let numberOfEntries = entryArray ? (entryArray.length === 1 ? `1 entry` : `${entryArray.length} entries`) : 'wtf';

	function doUpdate(id: number) {
		console.log('doUpdate for ', id);
	}

	function doDelete(id: number) {
		console.log('doDelete for ', id);
	}
</script>

<section class="mx-auto mt-10 max-w-prose px-3">
	{#if !entriesExist}
		<div>
			<div class="mb-10 mt-10">Create your first entry</div>
			<EntryCreateForm {entryForm} />
		</div>
	{:else}
		<p class="mt-2 text-base font-bold text-primary-400">
			Your registration of {numberOfEntries} has a total fee of ${costOfRegistration}
		</p>
		<div class="mt-6">
			<EntryAccordion {showButtons} {doDelete} {doUpdate} {entryArray} />
			<div class="mt-6">
				<EntryCreateDialog {entryForm} />
			</div>
			<!-- <Button class="mt-6" onclick={() => (showAdd = true)}>or - Add a New Entry?</Button> -->
		</div>
	{/if}
</section>
<!-- <SuperDebug data={currentEntries} /> -->
