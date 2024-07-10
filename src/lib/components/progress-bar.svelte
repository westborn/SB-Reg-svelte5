<script lang="ts">
	let { steps, currentStep }: { steps: []; currentStep: { value: number } } = $props();

	let stepsState: Array<{ description: string; completed: boolean; highlighted: boolean; selected: boolean }> = $state(
		[]
	);
	let displaySteps = updateStep(currentStep.value);

	function updateStep(stepNumber: number) {
		// first time through - setup the steps
		if (stepsState.length === 0) {
			stepsState = steps.map((step, index) => {
				return {
					description: step,
					completed: false,
					highlighted: index === 0 ? true : false,
					selected: index === 0 ? true : false
				};
			});
		}
		return stepsState.map((step, index) => {
			if (index === stepNumber) {
				return { ...step, highlighted: true, selected: true, completed: false }; // Current step
			} else if (index < stepNumber) {
				return { ...step, highlighted: false, selected: true, completed: true }; // Past step
			} else {
				return { ...step, highlighted: false, selected: false, completed: false }; // Future steps
			}
		});
	}
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
        {index < currentStep.value ? 'border-primary-400' : 'border-gray-300'}"
			></div>
		</div>
	{/each}
</div>
