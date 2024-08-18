<script lang="ts">
	import { page } from '$app/stores';
	import { getRegisterState } from '$lib/context.svelte';
	import Level2 from './level2.svelte';
	import { invalidateAll } from '$app/navigation';

	let myState = getRegisterState();

	let { firstName = $bindable() } = $props();
</script>

<section class="mt-6 border-spacing-2 border p-4">
	<p class="mt-4">LEVEL1</p>

	<div>
		<p>Page: {$page.data.submission.email}</p>
		<p>MyState: {myState?.submission?.email}</p>
	</div>

	<input
		class="w-48 rounded-md border border-input bg-background px-3 py-2 text-sm"
		type="text"
		name="firstName"
		id="2wH3Y"
		bind:value={firstName}
		aria-required="true"
		data-fs-control=""
	/>
	<p>{firstName}</p>
	<button
		class="m-6 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
		onclick={() => {
			if (myState.submission) {
				myState.submission.email = firstName as string;
			}
			// invalidateAll();
		}}>Log MyState</button
	>
	<button
		class="m-6 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
		onclick={() => {
			invalidateAll();
		}}>Invalidate</button
	>
</section>
<Level2 bind:firstName />
