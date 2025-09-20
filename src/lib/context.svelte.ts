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
import { MAX_IMAGES_UI_LIMIT, DEFAULT_PRIMARY_IMAGE_INDEX } from '$lib/constants';

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
	workingImages = $state() as CurrentImage[];
	primaryImageId = $state() as number | null;
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
	currentEditingEntryId = $state() as number | null;
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
		this.workingImages = [];
		this.primaryImageId = null;
	}

	// Multiple Images Helper Functions
	addWorkingImage(image: CurrentImage) {
		if (!image) {
			throw new Error('Image is required');
		}

		if (this.workingImages.length >= MAX_IMAGES_UI_LIMIT) {
			throw new Error(`Cannot add more than ${MAX_IMAGES_UI_LIMIT} images`);
		}

		this.workingImages = [...this.workingImages, image];

		// If this is the first image, set it as primary
		if (this.workingImages.length === 1 && image.id) {
			this.primaryImageId = image.id;
		}
	}

	removeWorkingImage(imageId: number) {
		if (this.workingImages.length <= 1) {
			throw new Error('Cannot remove the last remaining image');
		}

		const imageIndex = this.workingImages.findIndex((img) => img?.id === imageId);
		if (imageIndex === -1) {
			throw new Error('Image not found');
		}

		// If removing the primary image, set a new primary
		if (this.primaryImageId === imageId) {
			const remainingImages = this.workingImages.filter((img) => img?.id !== imageId);
			this.primaryImageId = remainingImages.length > 0 && remainingImages[0]?.id ? remainingImages[0].id : null;
		}

		this.workingImages = this.workingImages.filter((img) => img?.id !== imageId);
	}

	setPrimaryImage(imageId: number) {
		const image = this.workingImages.find((img) => img?.id === imageId);
		if (!image) {
			throw new Error('Image not found in working images');
		}
		this.primaryImageId = imageId;
	}

	getImagesWithPrimary() {
		const imagesWithPrimary = this.workingImages.map((image) => ({
			...image,
			isPrimary: image?.id === this.primaryImageId
		}));

		return {
			images: imagesWithPrimary,
			primaryImageId: this.primaryImageId
		};
	}

	clearWorkingImages() {
		this.workingImages = [];
		this.primaryImageId = null;
	}

	loadImagesFromEntry(entry: any) {
		if (entry.images && entry.images.length > 0) {
			this.workingImages = entry.images;
			// Set primary image from entry's primary image relationship
			if (entry.primaryImage?.imageId) {
				this.primaryImageId = entry.primaryImage.imageId;
			} else if (entry.images.length > 0) {
				// Fallback to first image if no primary is set
				this.primaryImageId = entry.images[0]?.id || null;
			}
		} else {
			this.clearWorkingImages();
		}
	}

	openEntryUpdateDialog(entryId: number) {
		this.currentEditingEntryId = entryId;
		this.entryUpdateDialogOpen = true;
		const entry = this.submission?.registrations[0].entries.find((entry) => entry.id === entryId);
		if (entry) {
			this.loadImagesFromEntry(entry);
		}
	}

	openEntryDeleteDialog(entryId: number) {
		this.currentEditingEntryId = entryId;
		this.entryDeleteDialogOpen = true;
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

export function updateWorkingImages(images: CurrentImage[], primaryImageId?: number | null) {
	const currentState = getRegisterState();
	currentState.workingImages = images;
	if (primaryImageId !== undefined) {
		currentState.primaryImageId = primaryImageId;
	}
	setContext(REGISTER_CTX, currentState);
	return currentState;
}

export function addWorkingImage(image: CurrentImage) {
	const currentState = getRegisterState();
	currentState.addWorkingImage(image);
	setContext(REGISTER_CTX, currentState);
	return currentState;
}

export function removeWorkingImage(imageId: number) {
	const currentState = getRegisterState();
	currentState.removeWorkingImage(imageId);
	setContext(REGISTER_CTX, currentState);
	return currentState;
}

export function updatePrimaryImage(imageId: number) {
	const currentState = getRegisterState();
	currentState.setPrimaryImage(imageId);
	setContext(REGISTER_CTX, currentState);
	return currentState;
}
