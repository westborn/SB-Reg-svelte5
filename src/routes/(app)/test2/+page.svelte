<script lang="ts">
	let { data } = $props();
	let { currentEntries: fromServer } = data;
	let currentEntries = $state(fromServer);

	let costOfRegistration = $derived(currentEntries ? 20 + currentEntries.length * 20 : 20);
	let numberOfEntries = $derived(
		currentEntries ? (currentEntries.length === 1 ? `1 entry` : `${currentEntries.length} entries`) : 'wtf'
	);
</script>

<section class="mx-auto mt-10 max-w-prose px-3">
	<p>Your registration of {numberOfEntries} has a total fee of ${costOfRegistration}</p>
	{#each currentEntries as entry}
		<p>
			{entry.title}
		</p>
	{/each}
</section>
<section class="mx-auto mt-10 max-w-prose px-3">
	<h2 class="text-2xl">Create Entry</h2>
	<p class="text-sm">Fill out the form below to create an entry</p>
	<form method="POST" action="?/createEntry" class="w-full space-y-4">
		<div class="mt-4 grid gap-3">
			<input type="text" name="title" value="the title" />
			<input type="text" name="price" value="10" />
			<input type="text" name="inOrOut" value="Outdoor" />
			<input type="text" name="material" value="the material" />
			<input type="text" name="specialRequirements" value="the specials" />
			<input type="text" name="enterMajorPrize" value="Yes" />
			<input type="text" name="description" value="lots of words" />
			<input type="text" name="dimHeight" value="12" />
			<input type="text" name="dimLength" value="23" />
			<input type="text" name="dimWidth" value="24" />
			<button type="submit">Submit</button>
		</div>
	</form>
</section>
