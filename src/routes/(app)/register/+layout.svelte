<script lang="ts">
	import { updateSubmission } from '$lib/context.svelte.ts';

	import { StepNavigation } from '$lib/components/index.js';
	import { untrack } from 'svelte';

	let { children, data } = $props();

	// Use untrack to capture initial submission value without reactivity warning
	const submission = untrack(() => data.submission);

	const myState = updateSubmission(submission);
	myState.stepsAllowed = true;
</script>

<section class="container mx-auto max-w-prose px-3">
	<StepNavigation />
	{@render children()}
</section>
<!-- <SuperDebug data={submission} /> -->
