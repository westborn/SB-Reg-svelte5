<script lang="ts">
	import { getRegisterState } from '$lib/context.svelte.js';
	import { EntryAccordion, EntryCreateForm } from '$lib/components';

	import type { Entry, Image } from '$lib/zod-schemas.ts';
	import { Button } from '$lib/components/ui/button';
	type EntryItem = Entry & { images?: Image[] };
	type EntryArray = EntryItem[];

	let { data } = $props();
	let { entryForm } = data;

	const myState = getRegisterState();
	const submissionEntries = myState?.submission?.registrations[0].entries as EntryArray;

	let showButtons = true;
	let showAdd = $state(false);

	let costOfRegistration = submissionEntries ? 20 + submissionEntries.length * 20 : 20;
	let numberOfEntries = submissionEntries
		? submissionEntries.length === 1
			? `1 entry`
			: `${submissionEntries.length} entries`
		: 'wtf';

	function doUpdate(id: number) {
		console.log('doUpdate for ', id);
	}

	function doDelete(id: number) {
		console.log('doDelete for ', id);
	}
</script>

<section class="mx-auto mt-10 max-w-prose px-3">
	{#if !myState.entriesExist}
		<div>
			<div class="mb-10 mt-10">Create a New Entry</div>
			<EntryCreateForm {entryForm} />
		</div>
	{:else}
		<p class="mt-2 text-base font-bold text-primary-400">
			Your registration of {numberOfEntries} has a total fee of ${costOfRegistration}
		</p>
		{#if showAdd}
			<div class="mb-10 mt-10 font-bold">Create a New Entry</div>
			<EntryCreateForm {entryForm} />
		{:else}
			<div class="mt-6">
				<EntryAccordion {showButtons} {doDelete} {doUpdate} {submissionEntries} />
				<Button class="mt-6" onclick={() => (showAdd = true)}>or - Add a New Entry?</Button>
			</div>
		{/if}
	{/if}
</section>
