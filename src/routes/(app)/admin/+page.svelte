<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { artists2024 } from '$lib/data/artists';
	import { page } from '$app/stores';

	type Artists = {
		firstName: string;
		lastName: string;
		phone: string;
		id: number;
		email: string;
	}[];

	let { data } = $props();
	const { form, artists: notNeeded } = data;
	const artists = artists2024.sort((a, b) => a.email.localeCompare(b.email));

	let searchTerm = $state('');

	// Setup the filter for searching / join a few fields to search on
	// if no search term entered - return them all
	const filteredEntries = $derived(
		artists.filter((x) => {
			if (searchTerm === '') return false;
			const searchText = x.firstName + x.lastName + x.email;
			return searchText.toLocaleLowerCase().includes(searchTerm.toLowerCase());
		})
	);

	const { message, enhance, formId } = superForm(form, {
		clearOnSubmit: 'errors'
	});
</script>

<div class="mx-1 mt-6 max-w-xl sm:container sm:mx-auto">
	<p>Currently acting as: <span class="text-red-500">{$page.data.user.proxyEmail}</span></p>
	<!-- Search Box -->
	<div>
		<div class="w-80 rounded p-4">
			<input
				bind:value={searchTerm}
				type="search"
				class="w-full rounded border border-solid border-gray-300 bg-white px-3 py-1.5 text-base font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
				placeholder="First Name, Last Name or Email"
				aria-label="Search"
			/>
		</div>
	</div>

	<form method="POST" use:enhance>
		{#each filteredEntries as artist}
			<div class="flex flex-row items-center justify-between pl-6">
				<button
					class="cursor-pointer text-sm font-semibold"
					name="email"
					value={artist.email}
					onclick={() => ($formId = artist.email)}
				>
					{artist.firstName} {artist.lastName} - {artist.email}</button
				>
			</div>
		{/each}
	</form>
	{#if $message}
		<div class="text-red-500">{$message}</div>
	{/if}
</div>
