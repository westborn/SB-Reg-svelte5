import { getContext, setContext } from 'svelte';
import type { Submission } from './zod-schemas';

type SetRegisterState = {
	submission: Submission | null;
};

export class RegisterState {
	currentUserEmail = false;
	registrationExists = false;
	stepsAllowed = false;
	submission = $state() as Submission;

	constructor(init: SetRegisterState) {
		this.submission = init.submission;
	}
}

const REGISTER_CTX = Symbol('register_ctx');

export function setRegisterState(init: SetRegisterState) {
	const registerState = new RegisterState(init);
	setContext(REGISTER_CTX, registerState);
	return registerState;
}

export function getRegisterState() {
	return getContext<RegisterState>(REGISTER_CTX);
}
