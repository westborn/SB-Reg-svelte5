<script lang="ts">
	import type { Entry, Image } from '$lib/zod-schemas.ts';
	type EntryItem = Entry & { images?: Image[] };
	type EntryArray = EntryItem[];

	import { setRegisterState, getRegisterState } from '$lib/state.svelte.js';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card/index.js';

	import { ArtistCreateDialog, ArtistUpdateDialog } from '$lib/components';

	import { ExhibitionYear } from '$lib/constants.js';
	import { EntryAccordion } from '$lib/components';
	import SuperDebug from 'sveltekit-superforms';

	let { data } = $props();
	setRegisterState({
		submission: data.submission,
		createArtistForm: data.createArtistForm,
		updateArtistForm: data.updateArtistForm,
		createEntryForm: data.createEntryForm
	});
	let myState = getRegisterState();
	myState.artistExists = data.submission ? true : false;
	myState.registrationExists = data.submission?.registrations?.length ?? 0 > 0 ? true : false;
	myState.entriesExist = data.submission?.registrations?.[0]?.entries?.length ?? 0 > 0 ? true : false;

	let showButtons = true;

	function doUpdate(id: number) {
		console.log('doUpdate for ', id);
	}

	function doDelete(id: number) {
		console.log('doDelete for ', id);
	}
</script>

<div class="mx-1 mt-6 max-w-xl sm:container sm:mx-auto">
	<Card.Root>
		<Card.Header class="p-2 sm:px-6">
			<Card.Title class="text-xl">Registration Management</Card.Title>
		</Card.Header>
		<Card.Content class="p-2 sm:px-6">
			<pre>{`Registration Exists: ${myState.registrationExists}`}</pre>
			<pre>{`Entries Exist: ${myState.entriesExist}`}</pre>
			{#if myState.artistExists && data.submission}
				<p class="text-sm text-muted-foreground">Some basic information we use to contact you:</p>
				<div class="mb-3 grid grid-cols-[14ch_1fr] items-center">
					<p class="text-sm">Email:</p>
					<p class="mb-2">{data.submission.email}</p>
					<p class="text-sm">First Name:</p>
					<p class="">{data.submission.firstName}</p>
					<p class="text-sm">Last Name:</p>
					<p class="">{data.submission.lastName}</p>
					<p class="text-sm">Phone:</p>
					<p class="">{data.submission.phone}</p>
					<p class="text-sm">Postcode:</p>
					<p class="">{data.submission.postcode}</p>
					<p class="text-sm">First Nation:</p>
					<p class="">{data.submission.firstNations}</p>
					<p class="text-sm">BSB:</p>
					<p class="">{data.submission.bankBSB}</p>
					<p class="text-sm">Account:</p>
					<p class="">{data.submission.bankAccount}</p>
					<p class="text-sm">Account Name:</p>
					<p class="">{data.submission.bankAccountName}</p>
				</div>
				<ArtistUpdateDialog />
				<EntryAccordion
					{showButtons}
					{doUpdate}
					{doDelete}
					submissionEntries={data.submission?.registrations?.[0]?.entries ?? []}
				/>
			{:else}
				<Button variant="default" on:click={() => (myState.dialogOpen = true)}
					>Register for the {ExhibitionYear} Exhibition?</Button
				>
				<ArtistCreateDialog />
			{/if}
		</Card.Content>
	</Card.Root>
</div>
<!-- <SuperDebug data={myState} /> -->
<!-- <pre>{JSON.stringify(data.submission, null, 2)}</pre> -->
