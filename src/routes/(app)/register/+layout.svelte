<script lang="ts">
	import SuperDebug, { superForm } from 'sveltekit-superforms';

	import { updateSubmission } from '$lib/context.svelte.ts';
	import { ProgressBar } from '$lib/components/index.js';

	import { getStep } from '$lib/state.svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let { children, data } = $props();
	let { submission } = data;
	const myState = updateSubmission(submission);
	myState.stepsAllowed = true;

	const steps = ['Register', 'Entries', 'Confirm', 'Complete'];
	function calcAllowableNextStep(newStep: number) {
		// Ensure newStep is within the bounds of the steps array
		let nextStepIndex = Math.max(0, Math.min(newStep, steps.length - 1));
		if (!myState.artistExists) return 0; // 'Register' step
		if (!myState.entriesExist && nextStepIndex > 0) return 1; // 'Entries' step
		if (nextStepIndex > 1 && !myState?.submission?.registrations[0]?.bumpIn) return 2; // 'Confirm' step
		if (myState.entriesExist && myState?.submission?.registrations[0]?.closed) return 3; // 'Complete' step
		return nextStepIndex;
	}
	const handleProgress = (stepIncrement: number) => {
		console.log('handleProgress', current.step, stepIncrement);
		const nextStep = current.step + stepIncrement;
		const allowedStep = calcAllowableNextStep(current.step + stepIncrement);
		if (nextStep < allowedStep) {
			current.step = nextStep;
		} else {
			current.step = allowedStep;
		}
		if (current.step === 0 && browser) {
			goto('/register/artist');
		}
		if (current.step === 1 && browser) {
			goto('/register/entry');
		}
		if (current.step === 2 && browser) {
			goto('/register/confirm');
		}
		if (current.step === 3 && browser) {
			goto('/register/complete');
		}
	};

	//setup the current step state
	let current = getStep();
	// check what is allowable - assume the user wants to see entries
	current.step = calcAllowableNextStep(1);
	handleProgress(0);

	// let showButtons = true;

	function doUpdate(id: number) {
		console.log('doUpdate for ', id);
	}

	function doDelete(id: number) {
		console.log('doDelete for ', id);
	}
</script>

{#if myState.submission}
	<section class="container mx-auto max-w-prose px-3">
		<ProgressBar {steps} />

		{@render children()}
		{#if myState.stepsAllowed}
			<div class="mt-10 flex max-w-2xl justify-around">
				{#if current.step > 0}
					<button
						class=" cursor-pointer rounded-lg border-0 bg-emerald-300 px-8 py-1 font-semibold text-gray-700"
						onclick={() => handleProgress(-1)}>Previous Step</button
					>
				{/if}
				{#if current.step < steps.length - 1}
					<button
						class=" cursor-pointer rounded-lg border-0 bg-emerald-300 px-10 py-1 font-semibold text-gray-700"
						onclick={() => handleProgress(+1)}>Next Step</button
					>
				{/if}
			</div>
		{/if}
	</section>
{:else}
	{@render children()}
{/if}
<SuperDebug data={submission} />
