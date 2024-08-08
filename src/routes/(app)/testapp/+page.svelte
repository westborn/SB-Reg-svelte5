<script lang="ts">
	import type { CurrentImage } from '$lib/components/server/registrationDB';
	import { ImageUploadForm, OptimisedImage } from '$lib/components';

	let { data } = $props();
	let { form: imageUploadForm, session, user, currentImage: providedImage } = data;

	let currentImage = $state(providedImage);
	let returnedImage = $state({}) as CurrentImage;
</script>

<div class="mx-1 mt-6 max-w-xl sm:container sm:mx-auto">
	<p class="my-6">This is an image upload page</p>
	<ImageUploadForm {currentImage} {imageUploadForm} {returnedImage} />
</div>

{#if returnedImage?.id}
	<div class="mx-1 mt-6 max-w-xl sm:container sm:mx-auto">
		<p class="my-6">Returned Image</p>
		<OptimisedImage
			path={returnedImage?.cloudURL ? returnedImage.cloudURL : '/dummy_160x160_ffffff_cccccc.png'}
			alt="Current Image"
			width={600}
			height={600}
			class="h-40 w-40 overflow-hidden rounded object-contain"
		/>
	</div>
{/if}
<!-- <SuperDebug data={form} /> -->
