<script lang="ts">
	import { setRegisterState, getRegisterState } from '$lib/state.svelte.js';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card/index.js';

	import { ArtistCreateDialog, ArtistUpdateDialog } from '$lib/components';
	import { ExhibitionYear } from '$lib/constants.js';
	import SuperDebug from 'sveltekit-superforms';

	let { data } = $props();

	//Set initial State with the submisison fro the email we have been given
	const myState = setRegisterState({
		currentUserEmail: 'george@westborn.com.au',
		submission: data.submission,
		createArtistForm: data.createArtistForm,
		updateArtistForm: data.updateArtistForm,
		createEntryForm: data.createEntryForm
	});
</script>

{#if !myState}
	<div class="mx-1 mt-6 max-w-xl sm:container sm:mx-auto">
		<p>Loading...</p>
	</div>
{:else}
	<div class="mx-1 mt-6 max-w-xl sm:container sm:mx-auto">
		<Card.Root>
			<Card.Header class="p-2 sm:px-6">
				<Card.Title class="text-xl">Registration Management</Card.Title>
			</Card.Header>
			<Card.Content class="p-2 sm:px-6">
				<pre>{`Registration Exists: ${myState.registrationExists}`}</pre>
				<pre>{`Entries Exist: ${myState.entriesExist}`}</pre>
				{#if myState?.artistExists && myState?.submission}
					<p class="text-sm text-muted-foreground">Some basic information we use to contact you:</p>
					<div class="mb-3 grid grid-cols-[14ch_1fr] items-center">
						<p class="text-sm">Email:</p>
						<p class="mb-2">{myState.submission.email}</p>
						<p class="text-sm">First Name:</p>
						<p class="">{myState.submission.firstName}</p>
						<p class="text-sm">Last Name:</p>
						<p class="">{myState.submission.lastName}</p>
						<p class="text-sm">Phone:</p>
						<p class="">{myState.submission.phone}</p>
						<p class="text-sm">Postcode:</p>
						<p class="">{myState.submission.postcode}</p>
						<p class="text-sm">First Nation:</p>
						<p class="">{myState.submission.firstNations}</p>
						<p class="text-sm">BSB:</p>
						<p class="">{myState.submission.bankBSB}</p>
						<p class="text-sm">Account:</p>
						<p class="">{myState.submission.bankAccount}</p>
						<p class="text-sm">Account Name:</p>
						<p class="">{myState.submission.bankAccountName}</p>
					</div>
					<ArtistUpdateDialog />
				{:else}
					<Button variant="default" on:click={() => (myState.dialogOpen = true)}
						>Register for the {ExhibitionYear} Exhibition?</Button
					>
					<ArtistCreateDialog />
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
	<SuperDebug data={myState} />
{/if}
