<script lang="ts">
	import { dev } from '$app/environment';
	import { PUBLIC_SQUARE_ENVIRONMENT } from '$env/static/public';
	import { EXHIBITION_YEAR, REGISTRATIONS_OPEN } from '$lib/constants.js';

	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import jsonToCsvExport from 'json-to-csv-export';

	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Select from '$lib/components/ui/select/index.js';

	let { data } = $props();
	const { emailForm, exhibits: exhibitsFromServer } = data;
	//don't mutate the original array
	const exhibits = $state([...exhibitsFromServer].sort((a, b) => a.email.localeCompare(b.email)));

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

	function proxyClosedState() {
		const proxyExhibit = exhibits.find((item) => page.data.user.proxyEmail === item.email);
		if (proxyExhibit) {
			return proxyExhibit.closed ? 'Closed' : 'Still Open';
		} else {
			return 'No Proxy Found';
		}
	}

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

	// toggle open/closed is only ever used for the proxyemail
	// nothing needs to be passed to the function - the user MUST be a superAdmin
	let toggleOpenClosedError = $state('');
	async function toggleOpenClosed() {
		const proxyExhibit = exhibits.find((item) => page.data.user.proxyEmail === item.email);
		if (proxyExhibit) {
			proxyExhibit.closed = !proxyExhibit.closed;
			//update the server
			const result = await fetch(`/api/toggleOpenClosed`, {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				}
			});
			if (result.status != 200) {
				const error = await result.json();
				console.log('response error', JSON.stringify(error));
				toggleOpenClosedError = error.message;
			}
		}
	}

	const years = ['2026', '2025', '2024', '2023', '2022'];

	let getCatalogueError = $state('');
	let selectedYear = $state(EXHIBITION_YEAR);
	let catalogueData = $state([]);
	async function getCatalogue() {
		getCatalogueError = '';
		try {
			const result = await fetch(`/api/getExhibits`, {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify({ entryYear: selectedYear })
			});
			if (result.status != 200) {
				const error = await result.json();
				console.log('response error', JSON.stringify(error));
				getCatalogueError = error.message;
			}
			catalogueData = await result.json();
			handleDownload('catalogue', catalogueData);
		} catch (err) {
			console.log('registerComplete-err' + err);
			getCatalogueError =
				typeof err === 'object' && err !== null && 'message' in err
					? (err as { message: string }).message
					: String(err);
		}
		return;
	}

	const textList = [
		['Environment:', `dev:${dev} meta.env.MODE:${import.meta.env.MODE}`],
		['Running in ', `"${PUBLIC_SQUARE_ENVIRONMENT}" mode`],
		['Registrations are', `${REGISTRATIONS_OPEN ? 'OPEN' : 'CLOSED'}`],
		['Current Year is', `${EXHIBITION_YEAR}`],
		['NAME:', __NAME__],
		['VERSION:', __VERSION__],
		['GITHUBURL ', __GITHUBURL__],
		['SVELTEVERSION:', __SVELTEVERSION__],
		['SVELTEKITVERSION:', __SVELTEKITVERSION__],
		['VITEVERSION:', __VITEVERSION__],
		['TAILWINDCSSVERSION:', __TAILWINDCSSVERSION__]
	];
</script>

<section class="mx-auto mt-2 px-3">
	<h4 class="text-xl font-bold text-primary">Admin Page</h4>
	<p class="mt-4">This page contains functions that you can use to get different views of the SB database</p>
	<p>It is a work in progress and will be updated as new features are added</p>
</section>

{#if page.data.user.isSuperAdmin}
	<section class="mx-auto mt-10 px-3">
		<hr class="mt-4" />
		<h4 class="text-lg font-semibold">
			Set Artist Email
			<span class="text-sm">
				- Currently acting as: <span class="text-red-500">{page.data.user.proxyEmail}</span> - {proxyClosedState()}
				<Button onclick={() => toggleOpenClosed()} variant="secondary" class="m-6 ">Toggle Open/Closed</Button></span
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

	<section class="mx-auto mt-10 px-3">
		<hr class="mt-4" />
		<h4 class="text-lg font-semibold">Download a Catalogue CSV</h4>
		<p class="mt-4">
			Generate a CSV file of the <span class="font-semibold text-red-500">{selectedYear}</span> Catalogue
			<Button onclick={() => getCatalogue()}>Download Catalogue</Button>
		</p>
		{#if toggleOpenClosedError}
			<div class="text-red-500">{toggleOpenClosedError}</div>
		{/if}

		<Select.Root type="single" bind:value={selectedYear} name="entryYear">
			<Select.Trigger class="w-[120px]">Select a year</Select.Trigger>
			<Select.Content>
				{#each years as year}
					<Select.Item value={year}>{year}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
		{#if getCatalogueError}
			<div class="text-red-500">{getCatalogueError}</div>
		{/if}
	</section>
{/if}

<section class="mx-auto mt-10 px-3">
	<hr class="mt-4" />
	<h4 class="text-lg font-semibold">Download Exhibits CSV</h4>
	<p class="mt-4">
		Generate a CSV file of the <span class="font-semibold text-red-500">{exhibits.length} exhibits</span> in the current
		exhibition
		<Button onclick={() => handleDownload('exhibits', exhibits)}>Download Exhibits</Button>
	</p>
</section>

<section class="mx-auto mt-10 px-3">
	<hr class="mt-4" />
	<h4 class="text-lg font-semibold">Download Artist details CSV</h4>
	<p class="mt-4">
		Generate a CSV file of the <span class="font-semibold text-red-500">{filteredArtists.length} artists</span> in the
		current exhibition
		<Button onclick={() => handleDownload('artists', filteredArtists)}>Download Artists</Button>
	</p>
</section>

{#if page.data.user.isSuperAdmin}
	<section class="mx-auto mt-20 px-3">
		<hr class="mt-4" />
		<h4 class="text-lg font-semibold">Version Details</h4>
		{#each textList as [textItem, textValue]}
			{@render TextList(textItem, textValue)}
		{/each}
	</section>

	{#snippet TextList(textItem: string, textValue: string)}
		<div class="grid grid-cols-[20ch_1fr]">
			<p class="text-sm">{textItem}</p>
			<p class="text-sm font-semibold">{textValue}&nbsp</p>
		</div>
	{/snippet}
{/if}
