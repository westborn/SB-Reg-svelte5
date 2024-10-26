import { getContext, setContext } from 'svelte';
import type { Infer, SuperValidated } from 'sveltekit-superforms';

import type {
	artistSchemaUI,
	entrySchemaUI,
	confirmSchemaUI,
	entryDeleteSchemaUI,
	fileUploadSchema
} from '$lib/zod-schemas';
import type { CurrentEntry, CurrentImage, Submission } from '$lib/components/server/registrationDB';

type RegisterInitial = {
	artistForm: SuperValidated<Infer<typeof artistSchemaUI>>;
	entryForm: SuperValidated<Infer<typeof entrySchemaUI>>;
	entryDeleteForm: SuperValidated<Infer<typeof entryDeleteSchemaUI>>;
	confirmForm: SuperValidated<Infer<typeof confirmSchemaUI>>;
	imageUploadForm: SuperValidated<Infer<typeof fileUploadSchema>>;
};
export class RegisterState {
	submission = $state() as Submission;
	workingEntry = $state() as CurrentEntry;
	workingImage = $state() as CurrentImage;
	artistExists = $derived(this.submission ? true : false);
	registrationExists = $derived((this.submission?.registrations?.length ?? 0 > 0) ? true : false);
	registrationCompleted = $derived((this.submission?.registrations?.[0]?.closed ?? false) ? true : false);
	entriesExist = $derived((this.submission?.registrations?.[0]?.entries?.length ?? 0 > 0) ? true : false);
	currentEntries = $derived(this.submission?.registrations?.[0]?.entries ?? []);
	artistCreateDialogOpen = $state(false);
	artistUpdateDialogOpen = $state(false);
	confirmDialogOpen = $state(false);
	entryCreateDialogOpen = $state(false);
	entryUpdateDialogOpen = $state(false);
	entryDeleteDialogOpen = $state(false);
	imageUploadDialogOpen = $state(false);
	stepsAllowed = $state(false);
	artistForm = $state() as SuperValidated<Infer<typeof artistSchemaUI>>;
	entryForm = $state() as SuperValidated<Infer<typeof entrySchemaUI>>;
	entryDeleteForm = $state() as SuperValidated<Infer<typeof entryDeleteSchemaUI>>;
	confirmForm = $state() as SuperValidated<Infer<typeof confirmSchemaUI>>;
	imageUploadForm = $state() as SuperValidated<Infer<typeof fileUploadSchema>>;

	constructor(init: RegisterInitial) {
		this.artistForm = init.artistForm;
		this.entryForm = init.entryForm;
		this.entryDeleteForm = init.entryDeleteForm;
		this.confirmForm = init.confirmForm;
		this.imageUploadForm = init.imageUploadForm;
	}
}
export type RegisterStateType = InstanceType<typeof RegisterState>;

export const REGISTER_CTX = Symbol('register_ctx');
export function setRegisterState(init: RegisterInitial) {
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
