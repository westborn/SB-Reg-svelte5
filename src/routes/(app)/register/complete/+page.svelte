<script lang="ts">
	import { getRegisterState } from '$lib/context.svelte.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { getStep } from '$lib/stepsState.svelte';
	import { goto } from '$app/navigation';

	let currentStep = getStep();
	currentStep.step = 3;
	const myState = getRegisterState();

	let costOfRegistration = $derived(myState.currentEntries ? 20 + myState.currentEntries.length * 20 : 20);
	let numberOfEntries = $derived(
		myState.currentEntries
			? myState.currentEntries.length + (myState.currentEntries.length === 1 ? ' entry' : ' entries')
			: ''
	);
	const href = `mailto:accounts@sculpturebermagui.org.au?subject=Request for Payment - Registration ${myState.submission?.email}`;

	const textList = $derived([
		['First Name:', myState?.submission?.firstName ?? ''],
		['Surname:', myState?.submission?.lastName ?? ''],
		['Email:', myState?.submission?.email ?? ''],
		['Phone:', myState?.submission?.phone ?? ''],
		['Postcode:', myState?.submission?.postcode ?? ''],
		['Bank Account:', myState?.submission?.bankAccountName ?? ''],
		['BSB:', myState?.submission?.bankBSB ?? ''],
		['Account:', myState?.submission?.bankAccount ?? '']
	]);
</script>

<div class="mx-1 mt-6 max-w-xl sm:container sm:mx-auto">
	{#if myState && myState.artistExists && myState.submission}
		<Card.Root>
			<Card.Header class="p-2 sm:px-6">
				<Card.Title class="text-xl">Registration Payment</Card.Title>
			</Card.Header>
			<Card.Content class="p-2 sm:px-6">
				<div class="my-3 grid grid-cols-[14ch_1fr] items-center">
					{#each textList as [textItem, textValue]}
						{@render TextList(textItem, textValue)}
					{/each}
				</div></Card.Content
			>
		</Card.Root>
		<p class="mt-6 text-xl text-red-500">
			Your registration of {numberOfEntries} has a total fee of ${costOfRegistration}
		</p>
		<p class="text-base">
			You are about to pay the registration fee by Credit or Debit card.
			<br />
			If you would like to make alternative payment arrangements please email
			<a class="text-blue-600 underline" {href} target="_blank" rel="noopener noreferrer"
				>accounts@sculpturebermagui.org.au</a
			><br />

			<br />
			Please note that your registration will not be complete until payment has been received.
			<a
				href="https://sculpturebermagui.org.au/wp-content/uploads/2023/11/Exhibiting-at-Sculpture-Bermagui-2024.pdf"
				class="text-blue-600 underline hover:text-blue-700 hover:underline"
				target="_blank"
				rel="noopener noreferrer">Artists Terms and Conditions</a
			>
		</p>
		<button
			onclick={() => goto('/register/payment')}
			type="submit"
			class="mt-4 inline-block w-auto rounded-lg bg-red-500 px-7 py-3 font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-red-500 hover:shadow-lg focus:bg-red-500 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-red-200 active:shadow-lg"
			>By clicking here I CONFIRM that all details are correct<br />
			<span class="text-base">and I have read the "Artists Terms & Conditions"</span><br />
		</button>
	{:else}
		<p class="text-sm text-muted-foreground">
			First you need to register for the exhibition,<br /> and provide some basic details so we can contact you.
		</p>
	{/if}
</div>

{#snippet TextList(textItem: string, textValue: string)}
	<p class="text-sm">{textItem}</p>
	<p>{textValue}&nbsp</p>
{/snippet}
