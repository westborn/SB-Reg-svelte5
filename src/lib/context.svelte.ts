import { getContext, setContext } from 'svelte';

import type { CurrentImage, Submission } from '$lib/components/server/registrationDB';

export class RegisterState {
	submission = $state() as Submission;
	workingImage = $state() as CurrentImage;
	artistExists = $state() as boolean;
	registrationExists = $state() as boolean;
	entriesExist = $state() as boolean;
	dialogOpen = $state(false);
	stepsAllowed = $state(false);
}

export const REGISTER_CTX = Symbol('register_ctx');

export function setRegisterState() {
	const registerState = new RegisterState();
	setContext(REGISTER_CTX, registerState);
	return registerState;
}

export function getRegisterState() {
	return getContext<RegisterState>(REGISTER_CTX);
}

export function updateSubmission(submission: Submission) {
	const currentState = getRegisterState();
	currentState.submission = submission;
	currentState.artistExists = submission ? true : false;
	currentState.registrationExists = submission?.registrations?.length ?? 0 > 0 ? true : false;
	currentState.entriesExist = submission?.registrations?.[0]?.entries?.length ?? 0 > 0 ? true : false;
	setContext(REGISTER_CTX, currentState);
	return currentState;
}

export function updateImage(image: CurrentImage) {
	const currentState = getRegisterState();
	currentState.workingImage = image;
	setContext(REGISTER_CTX, currentState);
	return currentState;
}
