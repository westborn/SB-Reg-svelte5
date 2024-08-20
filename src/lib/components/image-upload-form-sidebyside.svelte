<script lang="ts">
	import type { ChangeEventHandler } from 'svelte/elements';

	import { superForm, fileProxy } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { OptimisedImage } from '$lib/components';
	import { Button } from '$lib/components/ui/button';
	import { fileUploadSchema } from '$lib/zod-schemas.js';
	import { toast } from 'svelte-sonner';

	import * as Dialog from '$lib/components/ui/dialog';
	import { buttonVariants } from '$lib/components/ui/button/index.js';

	import { type CurrentImage } from '$lib/components/server/registrationDB';
	import { getRegisterState } from '$lib/context.svelte';
	import { cn } from '../utils';

	type Props = {
		buttonText?: string;
		currentImage: CurrentImage;
	};
	let { buttonText = 'Update Image?', currentImage }: Props = $props();
	let myState = getRegisterState();

	let imageDialogOpen = $state(false);
	let showChangeButton = $state(false);

	const { form, enhance, errors, delayed } = superForm(myState.imageUploadForm, {
		validators: zodClient(fileUploadSchema),
		resetForm: true,
		onResult({ result, cancel }) {
			if (result.type != 'success') {
				toast.error('Failed to upload image');
				cancel();
				return;
			}
			myState.workingImage = { ...result?.data?.image };
			console.log('returnedImage', myState.workingImage);
			toast.success('Image uploaded successfully');
			showChangeButton = false;
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
		showChangeButton = true;
	};
</script>

<Dialog.Root bind:open={imageDialogOpen}>
	<Dialog.Trigger class={buttonVariants({ variant: 'default' })}>{buttonText}</Dialog.Trigger>
	<Dialog.Content class="max-h-full max-w-[600px] overflow-y-auto bg-card">
		<Dialog.Header>
			<Dialog.Title>Change Image</Dialog.Title>
			<Dialog.Description>Upload a new image or replace an existing one</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<form method="POST" enctype="multipart/form-data" use:enhance action="?/imageUpload" id="imageUploadForm">
				<div class="grid grid-cols-[200px_120px_200px]">
					<div class="self-center">
						<span class="font-semibold"> Current Image </span>
						<OptimisedImage
							path={currentImage?.cloudURL ? currentImage.cloudURL : '/dummy_160x160_ffffff_cccccc.png'}
							alt="Current Image"
							width={160}
							height={160}
							class="h-40 w-40 overflow-hidden rounded object-contain"
						/>
					</div>
					<div class="self-center">
						<label
							class=" shadow-l flex cursor-pointer flex-col items-center rounded-lg bg-accent-400 font-semibold text-black hover:bg-accent-500 hover:text-gray-600"
						>
							<svg class="h-8 w-8" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
								<path
									d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z"
								/>
							</svg>
							<span class="mt-2 text-base leading-normal">Change Image?</span>
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
					<div class="px-10">
						<div bind:this={previewImageContainer}></div>
					</div>
				</div>

				{#if $errors.image}
					<div class="text-destructive" aria-live="assertive">
						{$errors.image}
					</div>
				{/if}
				{#if showChangeButton}
					<div class="ml-40 mt-8">
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
							<Button type="submit">Use the New Image?</Button>
						{/if}
					</div>
				{/if}
			</form>
		</div>
	</Dialog.Content>
</Dialog.Root>
