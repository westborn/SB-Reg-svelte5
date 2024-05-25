<script lang="ts">
	import { slide } from 'svelte/transition';

	import type { Entry, Image } from '$lib/zod-schemas.ts';
	type EntryItem = (Entry & { active?: boolean }) & { images?: Image[] };
	type EntryArray = EntryItem[];

	type Props = {
		showButtons: boolean;
		doUpdate: (id: number) => void;
		doDelete: (id: number) => void;
		submissionEntries: EntryArray;
	};

	let { showButtons, doUpdate, doDelete, submissionEntries }: Props = $props();
	const expand = (entryDisplayed: EntryItem) => {
		submissionEntries = submissionEntries.map((s) => {
			if (s.id === entryDisplayed.id) {
				s.active ? (s.active = false) : (s.active = true);
			}
			return s;
		});
	};

	const convertToDollars = (price: number | null | undefined) => {
		if (!price) return '';
		return (price / 100).toLocaleString('en-AU', {
			style: 'currency',
			currency: 'AUD'
		});
	};
</script>

<div class=" rounded-lg border bg-gray-50">
	{#each submissionEntries as entryDisplayed}
		<div class="m-2 bg-gray-100 p-2 text-gray-800">
			<button class="w-full text-left text-lg hover:bg-blue-100" onclick={() => expand(entryDisplayed)}>
				<span>
					{#if entryDisplayed.active}
						<span class="text-accent-600">&#9650;</span>
					{:else}
						<span>&#9654;</span>
					{/if}
				</span>

				{entryDisplayed.title}
				<span class="text-xs">
					({entryDisplayed.inOrOut})
				</span>
			</button>
			{#if entryDisplayed.active}
				<div class="mb-2 bg-slate-50 px-5 py-2 text-sm" transition:slide>
					<p>{entryDisplayed.description}</p>
					<div class="mx-auto flex items-center justify-between">
						<p class="text-lg">
							{convertToDollars(entryDisplayed.price)}
						</p>
						<p>{entryDisplayed?.enterMajorPrize ? 'Entered in Major Prize' : ''}</p>
						<p>({entryDisplayed.dimensions})</p>
					</div>

					<p>{entryDisplayed.material}</p>
					<p>{entryDisplayed?.specialRequirements}</p>

					<div
						class="mx-auto mt-10 flex h-48 w-48 flex-col items-center justify-center border-2 border-solid border-slate-200 text-slate-400"
					>
						{#if entryDisplayed?.images?.[0]?.imageURL}
							<img class="h-48 w-48 object-scale-down p-1" src={entryDisplayed?.images[0]?.imageURL} alt="Preview" />
						{:else}
							<span>Image Preview</span>
						{/if}
					</div>
					<!-- <pre>{JSON.stringify(entryDisplayed, null, 2)}</pre> -->
				</div>
				{#if showButtons}
					<div class="flex justify-between px-8">
						<button
							onclick={() => doUpdate(entryDisplayed.id)}
							class="bg-accent-200 hover:bg-accent-300 focus:bg-accent-300 active:bg-accent-100 rounded px-7 text-sm text-black shadow-md transition duration-150 ease-in-out hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-0 active:shadow-lg disabled:opacity-25"
							>Edit</button
						>

						<button
							onclick={() => doDelete(entryDisplayed.id)}
							class="rounded bg-red-600 px-7 text-sm text-white shadow-md transition duration-150 ease-in-out hover:bg-red-300 hover:shadow-lg focus:bg-red-300 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-red-100 active:shadow-lg disabled:opacity-25"
							>Delete</button
						>
					</div>
				{/if}
			{/if}
		</div>
	{/each}
</div>
