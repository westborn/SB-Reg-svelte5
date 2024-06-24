import { getContext, setContext } from 'svelte';
import type { Infer, SuperValidated } from 'sveltekit-superforms';
import { artistAddOrUpdateSchema, entryCreateSchema } from '$lib/zod-schemas';
import type { Submission } from '$lib/components/server/registrationDB';

type SetRegisterState = {
	currentUserEmail: string;
	submission: Submission;
	createArtistForm: SuperValidated<Infer<typeof artistAddOrUpdateSchema>>;
	updateArtistForm: SuperValidated<Infer<typeof artistAddOrUpdateSchema>>;
	createEntryForm: SuperValidated<Infer<typeof entryCreateSchema>>;
};
export class RegisterState {
	currentUserEmail = $state() as string;
	submission = $state() as Submission;
	artistExists = $state() as boolean;
	registrationExists = $state() as boolean;
	entriesExist = $state() as boolean;
	dialogOpen = $state(false);
	stepsAllowed = $state(false);
	createArtistForm = $state() as SuperValidated<Infer<typeof artistAddOrUpdateSchema>>;
	updateArtistForm = $state() as SuperValidated<Infer<typeof artistAddOrUpdateSchema>>;
	createEntryForm = $state() as SuperValidated<Infer<typeof entryCreateSchema>>;

	constructor(init: SetRegisterState) {
		this.currentUserEmail = init.currentUserEmail;
		this.submission = init.submission;
		this.artistExists = this.submission ? true : false;
		this.registrationExists = this.submission?.registrations?.length ?? 0 > 0 ? true : false;
		this.entriesExist = this.submission?.registrations?.[0]?.entries?.length ?? 0 > 0 ? true : false;
		this.createArtistForm = init.createArtistForm;
		this.updateArtistForm = init.updateArtistForm;
		this.createEntryForm = init.createEntryForm;
	}
}

export const REGISTER_CTX = Symbol('register_ctx');

export function setRegisterState(init: SetRegisterState) {
	const registerState = new RegisterState(init);
	setContext(REGISTER_CTX, registerState);
	return registerState;
}

export function getRegisterState() {
	const xyzzy = getContext<RegisterState>(REGISTER_CTX);
	console.log('getRegisterState');
	console.log(xyzzy?.submission?.id);
	return xyzzy;
}

export function updateSubmission({
	currentUserEmail,
	submission,
	createArtistForm,
	updateArtistForm,
	createEntryForm
}) {
	const currentState = getRegisterState();
	currentState.currentUserEmail = currentUserEmail;
	currentState.submission = submission;
	currentState.artistExists = submission ? true : false;
	currentState.registrationExists = submission?.registrations?.length ?? 0 > 0 ? true : false;
	currentState.entriesExist = submission?.registrations?.[0]?.entries?.length ?? 0 > 0 ? true : false;
	currentState.createArtistForm = createArtistForm;
	currentState.updateArtistForm = updateArtistForm;
	currentState.createEntryForm = createEntryForm;
	setContext(REGISTER_CTX, currentState);
	return currentState;
}
