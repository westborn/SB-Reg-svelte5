<script lang="ts">
	import { getStep } from '$lib/stepsState.svelte';
	let current = getStep();

	let { steps }: { steps: string[] } = $props();

	let stepsStateArray = steps.map((step) => {
		return {
			description: step,
			completed: false,
			highlighted: false,
			selected: false
		};
	});

	let displaySteps = $derived(
		stepsStateArray.map((step, index) => {
			if (index === current.step) {
				return { ...step, highlighted: true, selected: true, completed: false }; // Current step
			} else if (index < current.step) {
				return { ...step, highlighted: false, selected: true, completed: true }; // Past step
			} else {
				return { ...step, highlighted: false, selected: false, completed: false }; // Future steps
			}
		})
	);
</script>

<div class="flex items-center justify-between p-4">
	{#each displaySteps as step, index}
		<div class="flex items-center {index != steps.length - 1 ? 'w-full' : ''}">
			<div class="relative flex flex-col items-center">
				<!-- number of steps in a circle -->
				<div
					class="flex h-12 w-12 flex-col items-center justify-center rounded-full border-4 border-gray-300 font-semibold text-gray-600 transition duration-500 ease-in-out
					{step.highlighted ? 'rounded-lg' : ''}
					{step.selected ? 'border-primary-400 bg-primary-50 font-bold text-white' : ''}"
				>
					{#if step.completed}
						<span class="text-xl font-bold text-white">✓</span>
					{:else}
						{index + 1}
					{/if}
				</div>
				<!-- Display Description under the circle -->
				<div
					class="font- absolute top-0 mt-14 w-32 text-center text-xs font-semibold uppercase
					{step.highlighted ? 'text-gray-900' : 'text-gray-400'}"
				>
					{step.description}
				</div>
			</div>
			<!-- Line between circles-->
			<div
				class="flex-auto border-t-4 transition duration-500 ease-in-out
        {index < current.step ? 'border-primary-400' : 'border-gray-300'}"
			></div>
		</div>
	{/each}
</div>
