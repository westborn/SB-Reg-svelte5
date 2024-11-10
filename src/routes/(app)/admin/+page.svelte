<script lang="ts">
	import SuperDebug, { superForm } from 'sveltekit-superforms';

	import { page } from '$app/stores';

	let { data } = $props();
	const { emailForm, exhibits: exhibitsFromServer } = data;
	//don't mutate the original array
	const exhibits = [...exhibitsFromServer].sort((a, b) => a.email.localeCompare(b.email));

	let searchTerm = $state('');

	type FilteredEmails = { email: string; firstName: string; lastName: string }[];
	// filter unique emails of exhibits where user input matches email, firstname or lastname
	const filteredEmails: FilteredEmails = $derived(
		exhibits.reduce((accumulator: FilteredEmails, exhibit) => {
			const uniqExhibit = { email: exhibit.email, firstName: exhibit.firstName, lastName: exhibit.lastName };
			// if no search term entered or email already seen, return accumulator
			if (searchTerm === '' || accumulator.find((x) => x.email === uniqExhibit.email)) return accumulator;
			const searchText = exhibit.firstName + exhibit.lastName + exhibit.email;
			if (searchText.toLocaleLowerCase().includes(searchTerm.toLowerCase())) {
				accumulator.push(uniqExhibit);
			}
			return accumulator;
		}, [])
	);

	const { message } = superForm(emailForm, {});
</script>

<section class="mx-auto mt-2 px-3">
	<h4 class="text-xl font-bold text-primary">Admin Page</h4>
	<p class="mt-4">This page contains functions that you can use to get different views of the SB database</p>
	<p>It is a work in progress and will be updated as new features are added</p>
	<p class="mt-4 font-semibold">Currently you can:</p>
	<ul class="mx-12">
		<li class="w-full list-disc">
			Set the email address of the artist you would like to impersonate <span class="text-sm text-red-500">
				(SuperAdmin Only)</span
			>
		</li>
		<li class="w-full list-disc">Download a list of Exhibits</li>
		<li class="w-full list-disc">Download a list of Entries</li>
	</ul>
	<p class="mt-4">More features will be added soon</p>
</section>

{#if $page.data.user.isSuperAdmin}
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
						placeholder="Email/First Name/Last Name"
						aria-label="Search"
					/>
				</div>
			</div>

			<div class="grid w-full grid-cols-1 justify-between md:grid-cols-2 lg:grid-cols-3">
				{#each filteredEmails as exhibit}
					<button class="cursor-pointer text-left text-sm font-semibold" name="email" value={exhibit.email}>
						{exhibit.email} - {exhibit.firstName} {exhibit.lastName}</button
					>
				{/each}
			</div>
		</form>
		{#if $message}
			<div class="text-red-500">{$message}</div>
		{/if}
	</section>
{/if}

<section class="mx-auto mt-2 px-3">
	<hr class="mt-4" />
	<h4 class="text-lg font-semibold">Download Artist CSV</h4>
	<p class="mt-4">Generate a CSV file of all the exhibits in the current exhibition</p>
	{#each exhibits as exhibit}
		<div class="grid grid-cols-4">
			<div>{exhibit.entryId}</div>
			<div>{exhibit.email}</div>
			<div>{exhibit.firstName} {exhibit.lastName}</div>
			<div>{exhibit.closed}</div>
		</div>
	{/each}
</section>

<section class="mx-auto mt-2 px-3">
	<hr class="mt-4" />
	<h4 class="text-lg font-semibold">Download Entries CSV</h4>
	<p class="mt-4">Generate a CSV file of all the entries in the current exhibition</p>
</section>
