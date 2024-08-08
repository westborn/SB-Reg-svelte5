<script lang="ts">
	import { ImageUploadForm, OptimisedImage } from '$lib/components';
	import SuperDebug from 'sveltekit-superforms';
	import { getRegisterState, updateImage } from '$lib/context.svelte';

	let { data } = $props();
	let { form: imageUploadForm, session, user, currentImage } = data;

	let myState = getRegisterState();
	updateImage(null);
</script>

<div class="mx-1 mt-6 max-w-xl sm:container sm:mx-auto">
	<p class="my-6">This is an image upload page</p>
	<ImageUploadForm buttonText={'Change Image'} {currentImage} {imageUploadForm} />
</div>

{#if myState.workingImage?.id}
	<div class="mx-1 mt-6 max-w-xl sm:container sm:mx-auto">
		<p class="my-6">Returned Image</p>
		<OptimisedImage
			path={myState.workingImage?.cloudURL ? myState.workingImage?.cloudURL : '/dummy_160x160_ffffff_cccccc.png'}
			alt="Current Image"
			width={600}
			height={600}
			class="h-40 w-40 overflow-hidden rounded object-contain"
		/>
	</div>
{/if}
<SuperDebug data={myState.workingImage} />
