<script lang="ts">
	import type { ChangeEventHandler } from 'svelte/elements';

	import SuperDebug, { superForm, fileProxy } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { OptimisedImage } from '$lib/components';
	import { Button } from '$lib/components/ui/button';
	import { fileUploadSchema } from '$lib/zod-schemas.js';
	import { toast } from 'svelte-sonner';

	let { data } = $props();
	let { form: formData, session, user, currentImage } = data;

	let returnedImage = $state({});

	const { form, enhance, errors, message } = superForm(formData, {
		validators: zodClient(fileUploadSchema),
		resetForm: true,
		onUpdated: () => {
			toast.success($message);
			$message = null;
			returnedImage = $form.image;
		},
		onResult({ result, cancel }) {
			if (result.type != 'success') {
				toast.error('Failed to upload image');
				cancel();
				return;
			}
			returnedImage = { ...result?.data?.image };
			console.log('returnedImage', returnedImage);
		}
	});

	const file = fileProxy(form, 'image');

	let previewImageContainer: HTMLDivElement;
	let showUploadButton = $state(false);

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
		showUploadButton = true;
	};
</script>

<div class="mx-1 mt-6 max-w-xl sm:container sm:mx-auto">
	<form method="POST" enctype="multipart/form-data" use:enhance>
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
		{:else if showUploadButton}
			<div class="ml-40 mt-8">
				<Button type="submit">Use the New Image?</Button>
			</div>
		{/if}
	</form>
</div>
<!-- <SuperDebug data={form} /> -->
