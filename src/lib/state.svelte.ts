import { getContext, hasContext, setContext } from 'svelte';
import type { Infer, SuperValidated } from 'sveltekit-superforms';
import { artistAddOrUpdateSchema, entryCreateSchema } from '$lib/zod-schemas';
import type { Submission } from '$lib/components/server/registrationDB';

type SetRegisterState = {
	submission: Submission;
	createArtistForm: SuperValidated<Infer<typeof artistAddOrUpdateSchema>>;
	updateArtistForm: SuperValidated<Infer<typeof artistAddOrUpdateSchema>>;
	createEntryForm: SuperValidated<Infer<typeof entryCreateSchema>>;
};
export class RegisterState {
	currentUserEmail = $state(false);
	artistExists = $state(false);
	registrationExists = $state(false);
	entriesExist = $state(false);
	dialogOpen = $state(false);
	stepsAllowed = $state(false);
	submission = $state() as Submission;
	createArtistForm = $state() as SuperValidated<Infer<typeof artistAddOrUpdateSchema>>;
	updateArtistForm = $state() as SuperValidated<Infer<typeof artistAddOrUpdateSchema>>;
	createEntryForm = $state() as SuperValidated<Infer<typeof entryCreateSchema>>;

	constructor(init: SetRegisterState) {
		this.submission = init.submission;
		this.createArtistForm = init.createArtistForm;
		this.updateArtistForm = init.updateArtistForm;
		this.createEntryForm = init.createEntryForm;
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
