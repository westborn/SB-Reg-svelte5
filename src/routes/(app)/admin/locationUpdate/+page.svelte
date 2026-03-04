<script lang="ts">
	import LocationUpdateForm from '$lib/components/location-update-form.svelte';
	import type { Exhibit } from '$lib/components/server/registrationDB.js';
	import { untrack } from 'svelte';

	const { data } = $props();

	// Use untrack to capture initial values without reactivity warnings
	const locationForm = untrack(() => data.locationForm);
	const acceptedExhibits = untrack(() => data.exhibits?.filter((exhibit: Exhibit) => exhibit.accepted));

	let exhibits = $state(acceptedExhibits || []);

	let updateError = $state('');

	function updateLocationOnSuccess(entryId: number, exhibitNumber: string) {
		const index = exhibits.findIndex((exhibit: Exhibit) => exhibit.entryId === entryId);
		if (index === -1) {
			updateError = 'Exhibit not found';
			return;
		}
		exhibits[index].exhibitNumber = exhibitNumber;
	}
</script>

<div class="mx-1 mt-6 max-w-xl sm:container sm:mx-auto">
	<div class="grid">
		<div class="w-full max-w-screen-lg gap-2 p-2">
			<h4 class="text-primary text-xl font-bold">Change Exhibit Number(s)</h4>
			{#if updateError}
				<p class="text-red-500">{updateError}</p>
			{/if}
			{#if exhibits.length === 0}
				<p>No exhibits found</p>
			{:else}
				<div class="mt-6 grid grid-cols-[50px_200px_150px] items-center gap-1 text-base">
					<p class="text-primary text-nowrap">Entry</p>
					<p class="text-primary text-nowrap">Exhibit Number</p>
					<p class="text-primary text-nowrap">Artist - Title</p>
					{#each exhibits as exhibit, index}
						<p class="py-1 text-sm">{exhibit.entryId}</p>
						<LocationUpdateForm
							{locationForm}
							entryId={exhibit.entryId}
							exhibitNumber={exhibit.exhibitNumber}
							formOccurence={index}
							{updateLocationOnSuccess}
						/>
						<p class="text-sm text-nowrap">{exhibit.artistName} - {exhibit.title}</p>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
