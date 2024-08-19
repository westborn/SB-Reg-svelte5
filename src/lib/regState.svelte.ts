import { STEPS } from '$lib/constants';
import type { RegisterStateType } from '$lib/context.svelte';

let step = $state(0);

export function getStep() {
	return {
		get step() {
			return step;
		},
		set step(init) {
			step = init;
		},
		calcAllowableNextStep(myState: RegisterStateType, newStep: number) {
			// Ensure newStep is within the bounds of the steps array
			const nextStepIndex = Math.max(0, Math.min(newStep, STEPS.length - 1));
			if (!myState.artistExists) return 0; // 'Register' step
			if (!myState.entriesExist && nextStepIndex > 0) return 1; // 'Entries' step
			if (nextStepIndex > 1 && !myState?.submission?.registrations[0]?.bumpIn) return 2; // 'Confirm' step
			if (myState.entriesExist && myState?.submission?.registrations[0]?.closed) return 3; // 'Complete' step
			return nextStepIndex;
		}
	};
}
