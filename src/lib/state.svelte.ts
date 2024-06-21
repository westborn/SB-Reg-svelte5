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

const REGISTER_CTX = Symbol('register_ctx');

export function setRegisterState(init: SetRegisterState) {
	const registerState = new RegisterState(init);
	setContext(REGISTER_CTX, registerState);
	return registerState;
}

export function getRegisterState() {
	return getContext<RegisterState>(REGISTER_CTX);
}
