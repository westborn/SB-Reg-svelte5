<script lang="ts">
	import { getRegisterState } from '$lib/context.svelte.js';
	import { getStep } from '$lib/stepsState.svelte.js';

	let { data } = $props();

	let currentStep = getStep();
	currentStep.step = 3;

	const myState = getRegisterState();
</script>

{#if myState.submission}
	<div class="mx-1 mt-6 max-w-xl sm:container sm:mx-auto">
		<h1>Complete Page</h1>
		<h2>User: {data.user.email}</h2>
	</div>
{/if}
