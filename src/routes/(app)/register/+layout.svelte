<script lang="ts">
	import SuperDebug, { superForm } from 'sveltekit-superforms';

	import { updateSubmission } from '$lib/context.svelte.ts';
	import { ProgressBar } from '$lib/components/index.js';

	import { getStep } from '$lib/state.svelte';

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
	//setup the current step state
	let current = getStep();
	// check what is allowable - assume all steps completed
	current.step = calcAllowableNextStep(3);

	const handleProgress = (stepIncrement: number) => {
		current.step = calcAllowableNextStep(current.step + stepIncrement);
	};

	// let showButtons = true;

	// function doUpdate(id: number) {
	// 	console.log('doUpdate for ', id);
	// }

	// function doDelete(id: number) {
	// 	console.log('doDelete for ', id);
	// }
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
<SuperDebug data={current.step} />
