<script lang="ts">
	import { getRegisterState } from '$lib/context.svelte.js';
	import { ConfirmForm } from '$lib/components';

	const myState = getRegisterState();

	const textList = [
		['First Name', myState?.submission?.firstName ?? ''],
		['Surname', myState?.submission?.lastName ?? ''],
		['Email', myState?.submission?.email ?? ''],
		['Phone', myState?.submission?.phone ?? ''],
		['Postcode', myState?.submission?.postcode ?? ''],
		['Bank Account', myState?.submission?.bankAccountName ?? ''],
		['BSB', myState?.submission?.bankBSB ?? ''],
		['Account', myState?.submission?.bankAccount ?? ''],
		['Transport', myState?.submission?.registrations[0].transport ? 'Yes' : 'No'],
		['Accommodation', myState?.submission?.registrations[0].accommodation ? 'Yes' : 'No'],
		['Crane', myState?.submission?.registrations[0].crane ? 'Yes' : 'No'],
		['Bump In', myState?.submission?.registrations[0].bumpIn ?? ''],
		['Bump Out', myState?.submission?.registrations[0].bumpOut ?? ''],
		['Requirements', myState?.submission?.registrations[0].displayRequirements ?? '']
	];
	//TODO  get the layput and wording better for the confirm page
</script>

{#if myState.submission}
	<div class="mx-1 mt-6 max-w-xl sm:container sm:mx-auto">
		<h1>Confirm Page</h1>
		<h2>Registration: {myState.submission.registrations[0].id}</h2>

		<div class="mt-6 grid grid-cols-[13ch_1fr] items-center">
			{#each textList as [textItem, textValue]}
				{@render TextList(textItem, textValue)}
			{/each}
		</div>
		<ConfirmForm />
	</div>
{/if}

{#snippet TextList(textItem: string, textValue: string)}
	<p class="text-sm">{textItem}</p>
	<p class="">{textValue}</p>
{/snippet}
