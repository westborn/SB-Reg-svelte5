<script lang="ts">
	import { getRegisterState } from '$lib/context.svelte.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { ConfirmDialog } from '$lib/components';
	import { getStep } from '$lib/stepsState.svelte';

	let currentStep = getStep();
	currentStep.step = 2;
	const myState = getRegisterState();

	const textList = $derived([
		['First Name:', myState?.submission?.firstName ?? ''],
		['Surname:', myState?.submission?.lastName ?? ''],
		['Email:', myState?.submission?.email ?? ''],
		['Phone:', myState?.submission?.phone ?? ''],
		['Postcode:', myState?.submission?.postcode ?? ''],
		['Bank Account:', myState?.submission?.bankAccountName ?? ''],
		['BSB:', myState?.submission?.bankBSB ?? ''],
		['Account:', myState?.submission?.bankAccount ?? ''],
		['Crane:', myState?.submission?.registrations[0].crane ? 'Yes' : 'No'],
		['Bump In:', myState?.submission?.registrations[0].bumpIn ?? ''],
		['Bump Out:', myState?.submission?.registrations[0].bumpOut ?? ''],
		['Requirements:', myState?.submission?.registrations[0].displayRequirements ?? '']
	]);
	//TODO  get the layput and wording better for the confirm page
</script>

<div class="mx-1 mt-6 max-w-xl sm:container sm:mx-auto">
	<Card.Root>
		<Card.Header class="p-2 sm:px-6">
			<Card.Title class="text-xl">Exhibition Confirmation</Card.Title>
		</Card.Header>
		<Card.Content class="p-2 sm:px-6">
			{#if myState && myState.artistExists && myState.submission}
				<div class="my-3 grid grid-cols-[14ch_1fr] items-center">
					{#each textList as [textItem, textValue]}
						{@render TextList(textItem, textValue)}
					{/each}
				</div>
				<ConfirmDialog />
			{:else}
				<p class="text-sm text-muted-foreground">
					First you need to register for the exhibition,<br /> and provide some basic details so we can contact you.
				</p>
			{/if}
		</Card.Content>
	</Card.Root>
</div>

{#snippet TextList(textItem: string, textValue: string)}
	<p class="text-sm">{textItem}</p>
	<p class="text-sm font-semibold">{textValue}&nbsp</p>
{/snippet}
