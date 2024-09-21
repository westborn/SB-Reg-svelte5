<script lang="ts">
	import SuperDebug, { superForm } from 'sveltekit-superforms';

	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	import * as Select from '$lib/components/ui/select/index.js';

	let { data } = $props();
	const { emailForm, artists: artistsFromServer } = data;
	//don't mutate the original array
	const artists = [...artistsFromServer].sort((a, b) => a.email.localeCompare(b.email));

	let searchTerm = $state('');

	// Setup the filter for searching / join a few fields to search on
	// if no search term entered - don't return anything
	const filteredArtists = $derived(
		artists.filter((x) => {
			if (searchTerm === '') return false;
			const searchText = x.firstName + x.lastName + x.email;
			return searchText.toLocaleLowerCase().includes(searchTerm.toLowerCase());
		})
	);

	const { message } = superForm(emailForm, {});
</script>

<section class="mx-auto mt-2 px-3">
	<h4 class="text-xl font-bold text-primary">Admin Page</h4>
	<p class="mt-4">This page contains functions that you can use to get different views of the SB database</p>
	<p>It is a work in progress and will be updated as new features are added</p>
	<p class="mt-4 font-semibold">Currently you can:</p>
	<ul class="mx-12">
		<li class="w-full list-disc">Set the email address of the artist you would like to act on behalf of</li>
		<li class="w-full list-disc">View the list of artists in the database</li>
	</ul>
	<p class="mt-4">More features will be added soon</p>
</section>

<section class="mx-auto mt-2 px-3">
	<hr class="mt-4" />
	<h4 class="text-lg font-semibold">
		Set Artist Email
		<span class="text-sm">
			- (Currently acting as: <span class="text-red-500">{$page.data.user.proxyEmail})</span></span
		>
	</h4>
	<p class="mt-4">Search for the artist email you'd like to impersonate</p>
	<!-- Search Box -->
	<form method="POST" action="?/setArtistEmail">
		<div>
			<div class="w-80 rounded p-4">
				<input
					bind:value={searchTerm}
					type="search"
					class="w-full rounded border border-solid border-gray-300 bg-white px-3 py-1.5 text-base font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
					placeholder="Email"
					aria-label="Search"
				/>
			</div>
		</div>

		<div class="grid w-full grid-cols-1 justify-between md:grid-cols-2 lg:grid-cols-3">
			{#each filteredArtists as artist}
				<button class="cursor-pointer text-left text-sm font-semibold" name="email" value={artist.email}>
					{artist.email} - {artist.firstName} {artist.lastName}</button
				>
			{/each}
		</div>
	</form>
	{#if $message}
		<div class="text-red-500">{$message}</div>
	{/if}
</section>
