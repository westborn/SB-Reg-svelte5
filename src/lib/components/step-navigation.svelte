<script lang="ts">
	enum RegisterRoutes {
		REGISTER = '/register/artist',
		ENTRY = '/register/entry',
		CONFIRM = '/register/confirm',
		COMPLETE = '/register/complete'
	}

	const steps = [
		{
			title: 'Register',
			route: 'artist',
			link: RegisterRoutes.REGISTER
		},
		{
			title: 'Entries',
			route: 'entry',
			link: RegisterRoutes.ENTRY
		},
		{
			title: 'Confirm',
			route: 'confirm',
			link: RegisterRoutes.CONFIRM
		},
		{
			title: 'Complete',
			route: 'complete',
			link: RegisterRoutes.COMPLETE
		}
	];

	// get the current step ( 0 -> 3)
	let currentStep = 2;
</script>

<!-- list of form steps -->
<div class="flex items-center justify-between p-4">
	{#each steps as step, index}
		<div class="flex w-full items-center">
			<a href={step.link} class="flex items-center gap-2 text-xl disabled:text-white/50 lg:gap-5">
				<div class="relative flex flex-col items-center">
					<div
						class="flex h-12 w-12 flex-col items-center justify-center rounded-full border-4 border-gray-300 font-semibold text-gray-600
                {index <= currentStep ? 'border-primary-400 bg-primary-50 font-bold text-white' : ''}
                {index === currentStep ? 'rounded-lg' : ''}"
					>
						{#if index < currentStep}
							<span class="text-xl font-bold text-white">✓</span>
						{:else}
							{index + 1}
						{/if}
					</div>
					<div class="absolute top-0 mt-14 w-32 text-center text-xs font-semibold uppercase">{step.title}</div>
				</div>
			</a>
			<!-- Line between circles-->
			{#if index < steps.length - 1}
				<div class="flex-auto border-t-4 {index < currentStep ? 'border-primary-400' : 'border-gray-300'}"></div>
			{/if}
		</div>
	{/each}

	<!-- back button -->
	{#if currentStep > 0}
		<a
			href={steps[currentStep - 1]?.link || steps[0].link}
			class=" cursor-pointer rounded-lg border-0 bg-emerald-300 px-2 py-1 font-semibold text-gray-700">Back</a
		>
	{/if}
</div>
