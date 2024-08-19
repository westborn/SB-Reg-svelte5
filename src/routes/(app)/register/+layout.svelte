<script lang="ts">
	import { updateSubmission } from '$lib/context.svelte.ts';

	import { StepNavigation } from '$lib/components/index.js';

	let { children, data } = $props();
	let { submission } = data;
	const myState = updateSubmission(submission);
	myState.stepsAllowed = true;
</script>

<section class="container mx-auto max-w-prose px-3">
	<StepNavigation />
	{@render children()}
</section>
<!-- <SuperDebug data={submission} /> -->
