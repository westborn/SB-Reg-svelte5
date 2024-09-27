<script lang="ts">
	import { getStep } from '$lib/stepsState.svelte';

	import { STEPS } from '$lib/constants';
	import Button from '$lib/components/ui/button/button.svelte';
	import { getRegisterState } from '$lib/context.svelte.js';

	let myState = getRegisterState();

	let currentStep = getStep();

	function nextAllowableStep(step: number) {
		const nextStep =
			currentStep.calcAllowableNextStep(myState, step) < step ? currentStep.calcAllowableNextStep(myState, step) : step;
		return STEPS[nextStep]?.link ?? STEPS[0].link;
	}
</script>

<!-- <SuperDebug data={{ currentStep }} /> -->
<!-- list of form STEPS -->
<div class="flex items-center justify-between p-4">
	{#each STEPS as step, index}
		<div class="flex w-full items-center">
			<a href={nextAllowableStep(index)} class="flex items-center gap-2 text-xl disabled:text-white/50 lg:gap-5">
				<div class="relative flex flex-col items-center">
					<div
						class="flex h-12 w-12 flex-col items-center justify-center rounded-full border-4 border-gray-300 font-semibold text-gray-600
                {index <= currentStep.step ? 'border-primary-400 bg-primary-50 font-bold text-white' : ''}
                {index === currentStep.step ? 'rounded-lg' : ''}"
					>
						{#if index < currentStep.step}
							<span class="text-xl font-bold text-white">✓</span>
						{:else}
							{index + 1}
						{/if}
					</div>
					<div class="absolute top-0 mt-14 w-32 text-center text-xs font-semibold uppercase">{step.title}</div>
				</div>
			</a>
			<!-- Line between circles-->
			{#if index < STEPS.length - 1}
				<div class="flex-auto border-t-4 {index <= currentStep.step ? 'border-primary-400' : 'border-gray-300'}"></div>
				{#if index == currentStep.step}
					<div class="border-y-8 border-l-8 border-r-0 border-solid border-primary-400 border-y-transparent"></div>
				{/if}
			{/if}
		</div>
	{/each}

	<!-- back button -->
	<div class="min-w-10">
		{#if currentStep.step == 0}
			<a href={STEPS[currentStep.step + 1]?.link ?? STEPS[0].link}>
				<Button variant="ghost" class="bg-primary-50 text-white">Next</Button>
			</a>
		{:else}
			<a href={STEPS[currentStep.step - 1]?.link ?? STEPS[0].link}>
				<Button variant="ghost" class="bg-primary-50 text-white">Back</Button>
			</a>
		{/if}
	</div>
</div>
