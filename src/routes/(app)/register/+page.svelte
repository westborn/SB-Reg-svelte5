<script lang="ts">
	import { setRegisterState, getRegisterState } from '$lib/state.svelte.js';

	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card/index.js';

	import ArtistCreateDialog from '$lib/components/artist-create-dialog.svelte';
	import ArtistUpdateDialog from '$lib/components/artist-update-dialog.svelte';
	import SuperDebug from 'sveltekit-superforms';
	import { ExhibitionYear } from '$lib/constants.js';

	let { data } = $props();
	setRegisterState({
		submission: data.submission,
		createArtistForm: data.createArtistForm,
		updateArtistForm: data.updateArtistForm
	});
	let state = getRegisterState();

	$effect(() => {
		state.registrationExists = data.submission ? true : false;
	});
</script>

<div class="container mx-auto mt-10 max-w-xl">
	<Card.Root>
		<Card.Header class="py-2">
			<Card.Title class="text-xl">Registration Management</Card.Title>
		</Card.Header>
		<Card.Content>
			{#if state.registrationExists && data.submission}
				<p class="text-sm text-muted-foreground">Some basic information we use to contact you:</p>
				<div class="mb-3 grid grid-cols-[20ch_1fr] items-center p-4">
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
					<p class="text-sm">Bank Account Name:</p>
					<p class="">{data.submission.bankAccountName}</p>
					<p class="text-sm">BSB:</p>
					<p class="">{data.submission.bankBSB}</p>
					<p class="text-sm">Account:</p>
					<p class="">{data.submission.bankAccount}</p>
				</div>
				<ArtistUpdateDialog />
			{:else}
				<Button variant="default" on:click={() => (state.dialogOpen = true)}
					>Register for the {ExhibitionYear} Exhibition?</Button
				>
				<ArtistCreateDialog />
			{/if}
		</Card.Content>
	</Card.Root>
</div>
<!-- <SuperDebug data={state} /> -->
<!-- <pre>{JSON.stringify(data.submission, null, 2)}</pre> -->
