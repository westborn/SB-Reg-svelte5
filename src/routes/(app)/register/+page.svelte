<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	let { data } = $props();
	import { getRegisterState } from '$lib/context.svelte.js';
	import { getStep } from '$lib/state.svelte';
	let current = getStep();

	const myState = getRegisterState();

	if (!myState.artistExists && browser) {
		console.log('No submission found, redirecting to /register/artist');
		goto('/register/artist');
	}
</script>

{#if current.step === 0 && myState.submission}
	<div class="container mx-auto mt-6 max-w-prose px-3">
		<h1 class="text-2xl font-bold">Review your submission</h1>
		<div class="mt-2 grid grid-cols-[13ch_1fr] items-center">
			<p class="text-sm">First Name</p>
			<p>{myState.submission.firstName}</p>
			<p class="text-sm">Surname</p>
			<p>{myState.submission.lastName}</p>
			<p class="text-sm">Phone</p>
			<p>{myState.submission.phone}</p>
		</div>
	</div>
	{current.step}
{/if}
