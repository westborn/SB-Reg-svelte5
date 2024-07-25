<script lang="ts">
	import SuperDebug, { superForm } from 'sveltekit-superforms';

	import { updateSubmission } from '$lib/context.svelte.ts';
	import { getStep } from '$lib/regState.svelte.ts';

	import { StepNavigation } from '$lib/components/index.js';

	let { children, data } = $props();
	let { submission } = data;
	const myState = updateSubmission(submission);
	myState.stepsAllowed = true;

	// set the current step state variable ( 0 -> 3)
	let currentStep = getStep();
	// let showButtons = true;

	function doUpdate(id: number) {
		console.log('doUpdate for ', id);
	}

	function doDelete(id: number) {
		console.log('doDelete for ', id);
	}
</script>

<section class="container mx-auto max-w-prose px-3">
	<StepNavigation />
	{@render children()}
</section>
<!-- <SuperDebug data={submission} /> -->
