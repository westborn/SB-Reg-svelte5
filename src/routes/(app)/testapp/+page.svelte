<script lang="ts">
	import type { ChangeEventHandler } from 'svelte/elements';
	import SuperDebug, { superForm, fileProxy } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';
	import { OptimisedImage } from '$lib/components';

	const fileSchema = z.object({
		image: z
			.instanceof(File, { message: 'Please upload a file.' })
			.refine((f) => f.size < 5 * 1024 * 1024, 'Max 5Mb upload size.')
	});

	let { data } = $props();
	let { form: formData, session, user } = data;

	const { form, enhance, errors } = superForm(formData, {
		validators: zodClient(fileSchema)
	});

	const file = fileProxy(form, 'image');

	let previewImageContainer: HTMLDivElement;
	const renderPreview: ChangeEventHandler<HTMLInputElement> = (e) => {
		if (!e.currentTarget.files || e.currentTarget.files.length === 0) return;
		const [imageToUpload] = e.currentTarget.files;
		const previewImage = document.createElement('img');
		previewImage.src = URL.createObjectURL(imageToUpload);
		previewImage.alt = 'Preview Image';
		previewImage.className = 'aspect-square h-full w-full';
		previewImageContainer.innerHTML = '';
		previewImageContainer.appendChild(previewImage);
	};
</script>

Here I am

<OptimisedImage
	path="https://res.cloudinary.com/dpkmx9mow/image/upload/v1717244519/cvek2ay95deqt7biuoe6.jpg"
	alt="Hero Image"
	width={48}
	height={48}
	class="h-24 w-24 overflow-hidden rounded object-contain"
/>

<div class="container">
	<h1 class="title">SvelteKit &amp; Cloudinary Upload Widget</h1>

	<form method="POST" enctype="multipart/form-data" use:enhance>
		<label for="image" class="text-lg">Upload Image</label>
		<span class="text-xs">(Max 5 Mb)</span>
		<div class="space-between flex gap-4">
			<input type="file" name="image" accept="image/png, image/jpeg" bind:files={$file} onchange={renderPreview} />

			<div
				class="relative flex h-24 w-24 overflow-hidden rounded object-contain"
				bind:this={previewImageContainer}
			></div>
		</div>
		{#if $errors.image}<p>{$errors.image}</p>{/if}
		<button>Submit</button>
	</form>

	<!-- <img src={form.image} class="max-w-sm rounded-lg shadow-2xl" alt="uploaded" /> -->
</div>

<SuperDebug data={form} />
