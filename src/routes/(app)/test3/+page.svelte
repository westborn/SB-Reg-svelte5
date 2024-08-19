<script lang="ts">
	import { getStep } from '$lib/regState.svelte.ts';

	import { getRegisterState, updateSubmission } from '$lib/context.svelte.js';

	let { data } = $props();
	let { submission } = data;

	updateSubmission(submission);

	let myState = getRegisterState();

	let currentStep = getStep();
	currentStep.step = 0;
</script>

<section class="mx-auto mt-10 max-w-prose px-3">
	<p>artistExists: {myState.artistExists}</p>
	<p>registrationExists: {myState.registrationExists}</p>
	<p>entriesExist: {myState.entriesExist}</p>
	<p>currentEntries: {myState.currentEntries}</p>
	<p>Current: {currentStep.step}</p>
	<p>Allowable: {currentStep.calcAllowableNextStep(myState, currentStep.step)}</p>
	<button
		class="m-6 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
		onclick={() => {
			currentStep.step++;
			if (currentStep.calcAllowableNextStep(myState, currentStep.step) < currentStep.step) {
				currentStep.step = currentStep.calcAllowableNextStep(myState, currentStep.step);
			}
		}}>Increment step</button
	>
	<button
		class="m-6 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
		onclick={() => {
			currentStep.step--;
			if (currentStep.calcAllowableNextStep(myState, currentStep.step) < currentStep.step) {
				currentStep.step = currentStep.calcAllowableNextStep(myState, currentStep.step);
			}
		}}>Decrement step</button
	>
</section>
