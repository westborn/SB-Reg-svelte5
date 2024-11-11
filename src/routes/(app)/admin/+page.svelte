<script lang="ts">
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import jsonToCsvExport from 'json-to-csv-export';

	import { page } from '$app/stores';
	import Button from '../../../lib/components/ui/button/button.svelte';

	let { data } = $props();
	const { emailForm, exhibits: exhibitsFromServer } = data;
	//don't mutate the original array
	const exhibits = [...exhibitsFromServer].sort((a, b) => a.email.localeCompare(b.email));

	let searchTerm = $state('');

	type FilteredEmail = {
		email: string;
		firstName: string;
		lastName: string;
	};

	function isUniqueEmail(accumulator: FilteredEmail[], email: string): boolean {
		return !accumulator.find((x) => x.email === email);
	}

	function matchesSearchTerm(exhibit: FilteredEmail, term: string): boolean {
		if (term === '') return false;
		const searchText = `${exhibit.firstName}${exhibit.lastName}${exhibit.email}`;
		return searchText.toLowerCase().includes(term.toLowerCase());
	}

	const filteredEmails = $derived(
		exhibits.reduce((accumulator: FilteredEmail[], exhibit) => {
			const artistData = {
				email: exhibit.email,
				firstName: exhibit.firstName,
				lastName: exhibit.lastName
			};
			if (isUniqueEmail(accumulator, artistData.email) && matchesSearchTerm(artistData, searchTerm)) {
				accumulator.push(artistData);
			}
			return accumulator;
		}, [])
	);

	const filteredArtists = $derived(
		exhibits.reduce((accumulator: FilteredEmail[], exhibit) => {
			const artistData = {
				artistId: exhibit.artistId,
				email: exhibit.email,
				firstName: exhibit.firstName,
				lastName: exhibit.lastName,
				phone: exhibit.phone,
				postcode: exhibit.postcode,
				bankAccountName: exhibit.bankAccountName,
				bankAccount: exhibit.bankAccount,
				bankBSB: exhibit.bankBSB,
				firstNations: exhibit.firstNations
			};
			if (isUniqueEmail(accumulator, artistData.email)) {
				accumulator.push(artistData);
			}
			return accumulator;
		}, [])
	);

	const { message } = superForm(emailForm, {});

	function formatDatePart(num: number): string {
		return num.toString().padStart(2, '0');
	}

	function getFormattedDateTime(): string {
		const date = new Date();
		const year = date.getFullYear();
		const month = formatDatePart(date.getMonth() + 1);
		const day = formatDatePart(date.getDate());
		const hours = formatDatePart(date.getHours());
		const minutes = formatDatePart(date.getMinutes());
		const seconds = formatDatePart(date.getSeconds());

		return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
	}

	function handleDownload(filePrefix: string, data: any) {
		const filename = `${filePrefix}_${getFormattedDateTime()}.csv`;
		jsonToCsvExport({ data, filename });
	}
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
	<h4 class="text-lg font-semibold">Download Exhibits CSV</h4>
	<p class="mt-4">
		Generate a CSV file of the <span class="font-semibold text-red-500">{exhibits.length} exhibits</span> in the current
		exhibition
		<Button onclick={() => handleDownload('exhibits', exhibits)}>Download Data</Button>
	</p>
</section>

<section class="mx-auto mt-2 px-3">
	<hr class="mt-4" />
	<h4 class="text-lg font-semibold">Download Artist details CSV</h4>
	<p class="mt-4">
		Generate a CSV file of the <span class="font-semibold text-red-500">{filteredArtists.length} artists</span> in the
		current exhibition
		<Button onclick={() => handleDownload('artists', filteredArtists)}>Download Data</Button>
	</p>
</section>
