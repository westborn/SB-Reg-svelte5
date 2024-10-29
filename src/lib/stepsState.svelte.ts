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

			const completedBankDetails =
				myState?.submission?.bankAccountName && myState?.submission?.bankBSB && myState?.submission?.bankAccount
					? true
					: false;
			if (nextStepIndex > 1 && myState.entriesExist && !completedBankDetails) return 2; // 'Confirm' step

			const hasNoImage =
			!myState.artistExists || !myState.entriesExist || myState.currentEntries.some((entry) => entry.images.length === 0)
				? true
				: false;
			if (myState.entriesExist && hasNoImage) return 2; // 'Complete' step

			if (myState.entriesExist && completedBankDetails) return 3; // 'Complete' step
			return nextStepIndex;
		}
	};
}
