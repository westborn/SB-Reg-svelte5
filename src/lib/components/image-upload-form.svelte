<script lang="ts">
	import type { ChangeEventHandler } from 'svelte/elements';

	import { superForm, fileProxy } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { Button } from '$lib/components/ui/button';
	import { fileUploadSchema } from '$lib/zod-schemas.js';
	import { toast } from 'svelte-sonner';

	import * as Dialog from '$lib/components/ui/dialog';
	import { buttonVariants } from '$lib/components/ui/button/index.js';

	import { getRegisterState } from '$lib/context.svelte';
	import { cn } from '$lib/utils';
	import { MAX_IMAGE_SIZE } from '../constants';

	type Props = {
		buttonText?: string;
	};
	let { buttonText = 'Update Image?' }: Props = $props();

	let myState = getRegisterState();

	let imageDialogOpen = $state(false);
	let showButton = $state(false);

	const { form, enhance, errors, delayed } = superForm(myState.imageUploadForm, {
		validators: zodClient(fileUploadSchema),
		resetForm: true,
		onResult({ result, cancel }: { result: any; cancel: () => void }) {
			if (result.type != 'success') {
				toast.error('Failed to upload image');
				cancel();
				imageDialogOpen = false;
			}
			myState.workingImage = { ...result?.data?.newImage };
			toast.success('Image uploaded successfully');
			cancel();
			imageDialogOpen = false;
		}
	});

	const file = fileProxy(form, 'image');

	let previewImageContainer: HTMLDivElement;

	const renderPreview: ChangeEventHandler<HTMLInputElement> = (e) => {
		if (!e.currentTarget.files || e.currentTarget.files.length === 0) return;
		const [imageToUpload] = e.currentTarget.files;
		const previewImage = document.createElement('img');
		const previewSpan = document.createElement('span');
		previewSpan.textContent = 'New Image';
		previewSpan.className = 'font-semibold';
		previewImage.src = URL.createObjectURL(imageToUpload);
		previewImage.alt = 'Preview Image';
		previewImage.className = '';
		previewImageContainer.innerHTML = '';
		previewImageContainer.appendChild(previewSpan);
		previewImageContainer.appendChild(previewImage);
		showButton = imageToUpload.size < MAX_IMAGE_SIZE;
	};

	const openChange = (isOpen: boolean) => {
		// only show the "Use" button if the image is valid
		if (isOpen) {
			showButton = false;
			myState.workingImage = null;
		}
	};
</script>

<Dialog.Root bind:open={imageDialogOpen} onOpenChange={openChange}>
	<Dialog.Trigger class={buttonVariants({ variant: 'default' })}>{buttonText}</Dialog.Trigger>
	<Dialog.Content class="max-h-full max-w-[400px] overflow-y-auto bg-card">
		<Dialog.Header>
			<Dialog.Title>Image Upload</Dialog.Title>
		</Dialog.Header>
		<div class="grid grid-cols-1 gap-4 py-4">
			<form method="POST" enctype="multipart/form-data" use:enhance action="?/uploadImage" id="imageUploadForm">
				<div class="flex flex-col">
					<div class="px-10">
						<div bind:this={previewImageContainer}></div>
					</div>
					{#if $errors.image}
						<div class="text-destructive" aria-live="assertive">
							{$errors.image}
						</div>
					{/if}
					<div class="mt-8" hidden={!showButton}>
						{#if $delayed}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class={cn('animate-spin')}
							>
								<path d="M21 12a9 9 0 1 1-6.219-8.56" />
							</svg>
						{:else}
							<Button type="submit">Use this Image?</Button>
						{/if}
					</div>
					<div class="max-w-[300px] self-center" hidden={showButton}>
						<label
							class=" shadow-l flex cursor-pointer flex-col items-center rounded-lg bg-accent-400 font-semibold text-black hover:bg-accent-500 hover:text-gray-600"
						>
							<svg class="h-8 w-8" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
								<path
									d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z"
								/>
							</svg>
							<span class="mt-2">Upload</span>
							<span class="text-xs">(Max 5 Mb)</span>
							<input
								type="file"
								name="image"
								accept="image/png, image/jpeg"
								bind:files={$file}
								onchange={renderPreview}
								hidden
							/>
						</label>
					</div>
				</div>
			</form>
		</div>
	</Dialog.Content>
</Dialog.Root>
