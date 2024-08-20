import { getContext, setContext } from 'svelte';
import type { Infer, SuperValidated } from 'sveltekit-superforms';

import type { artistSchemaUI, entrySchemaUI, fileUploadSchema } from '$lib/zod-schemas';
import type { CurrentEntry, CurrentImage, Submission } from '$lib/components/server/registrationDB';

type SetRegState = {
	artistForm: SuperValidated<Infer<typeof artistSchemaUI>>;
	entryForm: SuperValidated<Infer<typeof entrySchemaUI>>;
	imageUploadForm: SuperValidated<Infer<typeof fileUploadSchema>>;
};
export class RegisterState {
	submission = $state() as Submission;
	workingEntry = $state() as CurrentEntry;
	workingImage = $state() as CurrentImage;
	artistExists = $derived(this.submission ? true : false);
	registrationExists = $derived((this.submission?.registrations?.length ?? 0 > 0) ? true : false);
	entriesExist = $derived((this.submission?.registrations?.[0]?.entries?.length ?? 0 > 0) ? true : false);
	currentEntries = $derived(this.submission?.registrations?.[0]?.entries ?? []);
	stepsAllowed = $state(false);
	artistForm = $state() as SuperValidated<Infer<typeof artistSchemaUI>>;
	artistDialogOpen = $state(false);
	entryForm = $state() as SuperValidated<Infer<typeof entrySchemaUI>>;
	entryCreateDialogOpen = $state(false);
	entryUpdateDialogOpen = $state(false);
	imageUploadForm = $state() as SuperValidated<Infer<typeof fileUploadSchema>>;
	imageUploadDialogOpen = $state(false);

	constructor(init: SetRegState) {
		this.artistForm = init.artistForm;
		this.entryForm = init.entryForm;
		this.imageUploadForm = init.imageUploadForm;
	}
}
export type RegisterStateType = InstanceType<typeof RegisterState>;

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
	setContext(REGISTER_CTX, currentState);
	return currentState;
}

export function updateWorkingEntry(entry: CurrentEntry) {
	const currentState = getRegisterState();
	currentState.workingEntry = entry;
	setContext(REGISTER_CTX, currentState);
	return currentState;
}

export function updateWorkingImage(image: CurrentImage) {
	const currentState = getRegisterState();
	currentState.workingImage = image;
	setContext(REGISTER_CTX, currentState);
	return currentState;
}
