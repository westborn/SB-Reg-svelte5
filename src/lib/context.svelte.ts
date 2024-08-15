import { getContext, setContext } from 'svelte';
import type { Infer, SuperValidated } from 'sveltekit-superforms';

import type { artistSchemaUI, entrySchemaUI, fileUploadSchema } from '$lib/zod-schemas';
import type { CurrentImage, Submission } from '$lib/components/server/registrationDB';

type SetRegState = {
	artistForm: SuperValidated<Infer<typeof artistSchemaUI>>;
	entryForm: SuperValidated<Infer<typeof entrySchemaUI>>;
	imageUploadForm: SuperValidated<Infer<typeof fileUploadSchema>>;
};
export class RegisterState {
	submission = $state() as Submission;
	workingImage = $state() as CurrentImage;
	artistExists = $state() as boolean;
	registrationExists = $state() as boolean;
	entriesExist = $state() as boolean;
	dialogOpen = $state(false);
	stepsAllowed = $state(false);
	artistForm = $state() as SuperValidated<Infer<typeof artistSchemaUI>>;
	entryForm = $state() as SuperValidated<Infer<typeof entrySchemaUI>>;
	imageUploadForm = $state() as SuperValidated<Infer<typeof fileUploadSchema>>;

	constructor(init: SetRegState) {
		this.artistForm = init.artistForm;
		this.entryForm = init.entryForm;
		this.imageUploadForm = init.imageUploadForm;
	}
}

export const REGISTER_CTX = Symbol('register_ctx');
export function setRegisterState(init: SetRegState) {
	const registerState = new RegisterState(init);
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
	currentState.registrationExists = (submission?.registrations?.length ?? 0 > 0) ? true : false;
	currentState.entriesExist = (submission?.registrations?.[0]?.entries?.length ?? 0 > 0) ? true : false;
	setContext(REGISTER_CTX, currentState);
	return currentState;
}

export function updateImage(image: CurrentImage) {
	const currentState = getRegisterState();
	currentState.workingImage = image;
	setContext(REGISTER_CTX, currentState);
	return currentState;
}
