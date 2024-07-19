<script lang="ts">
	import { getRegisterState } from '$lib/context.svelte.js';
	import * as Card from '$lib/components/ui/card/index.js';

	import { ArtistCreateForm, ArtistUpdateDialog } from '$lib/components';
	let { data } = $props();
	const { artistForm } = data;

	let myState = getRegisterState();
</script>

<div class="mx-1 mt-6 max-w-xl sm:container sm:mx-auto">
	<Card.Root>
		<Card.Header class="p-2 sm:px-6">
			<Card.Title class="text-xl">Artist Registration</Card.Title>
		</Card.Header>
		<Card.Content class="p-2 sm:px-6">
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
				<ArtistUpdateDialog {artistForm} />
			{:else}
				<p class="text-sm text-muted-foreground">
					First you need to register for the exhibition,<br /> and provide some basic details so we can contact you.
				</p>
				<ArtistCreateForm {artistForm} />
			{/if}
		</Card.Content>
	</Card.Root>
</div>
