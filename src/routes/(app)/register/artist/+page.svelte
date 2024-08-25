<script lang="ts">
	import { getRegisterState, type RegisterStateType } from '$lib/context.svelte.js';
	import { getStep } from '$lib/stepsState.svelte';
	import * as Card from '$lib/components/ui/card/index.js';

	import { ArtistCreateForm, ArtistUpdateDialog } from '$lib/components';

	let myState = getRegisterState();
	let currentStep = getStep();
	currentStep.step = 0;

	const textList = $derived([
		['Email:', myState?.submission?.email ?? ''],
		['First Name:', myState?.submission?.firstName ?? ''],
		['Surname:', myState?.submission?.lastName ?? ''],
		['Phone:', myState?.submission?.phone ?? ''],
		['Postcode:', myState?.submission?.postcode ?? ''],
		['firstNation:', myState?.submission?.firstNations ?? ''],
		['Bank Account:', myState?.submission?.bankAccountName ?? ''],
		['BSB:', myState?.submission?.bankBSB ?? ''],
		['Account:', myState?.submission?.bankAccount ?? '']
	]);
</script>

<div class="mx-1 mt-6 max-w-xl sm:container sm:mx-auto">
	<Card.Root>
		<Card.Header class="p-2 sm:px-6">
			<Card.Title class="text-xl">Artist Registration</Card.Title>
		</Card.Header>
		<Card.Content class="p-2 sm:px-6">
			{#if myState && myState.artistExists && myState.submission}
				<p class="text-sm text-muted-foreground">Some basic information we use to contact you:</p>
				<div class="mb-3 grid grid-cols-[14ch_1fr] items-center">
					{#each textList as [textItem, textValue]}
						{@render TextList(textItem, textValue)}
					{/each}
				</div>
				<ArtistUpdateDialog />
			{:else}
				<p class="text-sm text-muted-foreground">
					First you need to register for the exhibition,<br /> and provide some basic details so we can contact you.
				</p>
				<ArtistCreateForm />
			{/if}
		</Card.Content>
	</Card.Root>
</div>

{#snippet TextList(textItem: string, textValue: string)}
	<p class="text-sm">{textItem}</p>
	<p class="mb-1">{textValue}</p>
{/snippet}
