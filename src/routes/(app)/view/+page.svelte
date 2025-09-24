<script lang="ts">
	import { REGISTRATIONS_OPEN } from '$lib/constants';
	import { getRegisterState, updateSubmission } from '$lib/context.svelte.js';
	import { EntryCard } from '$lib/components';

	let { data } = $props();
	let { submission, user } = data;

	updateSubmission(submission);

	let myState = getRegisterState();

	let costOfRegistration = $derived(myState.currentEntries ? 20 + myState.currentEntries.length * 20 : 20);
	let numberOfEntries = $derived(
		myState.currentEntries
			? myState.currentEntries.length + (myState.currentEntries.length === 1 ? ' entry' : ' entries')
			: ''
	);

	const textList = $derived([
		['First Name:', myState?.submission?.firstName ?? ''],
		['Surname:', myState?.submission?.lastName ?? ''],
		['Email:', myState?.submission?.email ?? ''],
		['Phone:', myState?.submission?.phone ?? '']
	]);
</script>

<section class="mx-auto mt-2 max-w-[500px] px-3">
	{#if (REGISTRATIONS_OPEN || user.isSuperAdmin) && myState.artistExists}
		<h3 class="text-xl font-bold text-primary">Registration Information</h3>
		<div class="my-3 grid grid-cols-[14ch_1fr] items-center">
			{#each textList as [textItem, textValue]}
				{@render TextList(textItem, textValue)}
			{/each}
		</div>
		{#if myState.entriesExist}
			<p class="mb-6 text-xl text-red-500">
				Your registration of {numberOfEntries} has a total fee of ${costOfRegistration}
				{myState.registrationCompleted ? ' and is complete' : ''}
			</p>

			{#each myState.currentEntries as entryItem, entryKey}
				<EntryCard {entryItem} />
			{/each}
		{/if}
	{:else if REGISTRATIONS_OPEN && !myState.artistExists}
		<p class="mt-6 text-red-500">No registration found - please Register</p>
	{:else}
		<h3 class="text-xl font-bold text-red-500">Registration is not available at the moment</h3>
	{/if}
</section>
{#snippet TextList(textItem: string, textValue: string)}
	<p class="text-sm">{textItem}</p>
	<p class="text-sm font-semibold">{textValue}&nbsp</p>
{/snippet}
