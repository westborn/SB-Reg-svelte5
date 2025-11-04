<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import { getRegisterState } from '$lib/context.svelte';
	import { MAX_IMAGES_UI_LIMIT, MIN_IMAGES_PER_ENTRY } from '$lib/constants';
	import { toast } from 'svelte-sonner';
	import Upload from 'lucide-svelte/icons/upload';
	import AlertCircle from 'lucide-svelte/icons/circle-alert';
	import Star from 'lucide-svelte/icons/star';
	import X from 'lucide-svelte/icons/x';

	let myState = getRegisterState();
	let fileInputRef: HTMLInputElement | undefined = $state();
	let isUploading = $state(false);

	// Reactive state for images display
	const images = $derived(myState.workingImages || []);
	const primaryImageId = $derived(myState.primaryImageId);
	const canAddMore = $derived(images.length < MAX_IMAGES_UI_LIMIT);
	const hasMinImages = $derived(images.length >= MIN_IMAGES_PER_ENTRY);

	const handleAddImage = () => {
		fileInputRef?.click();
	};

	const handleFileSelect = (event: Event) => {
		const target = event.target as HTMLInputElement;
		const selectedFile = target.files?.[0];
		if (!selectedFile) return;

		handleImageUpload(selectedFile);

		// Clear the input
		target.value = '';
	};

	const handleImageUpload = async (selectedFile: File) => {
		if (!canAddMore) {
			toast.error(`Maximum ${MAX_IMAGES_UI_LIMIT} images allowed`);
			return;
		}

		isUploading = true;

		try {
			// Create FormData for the API call
			const formData = new FormData();
			formData.append('file', selectedFile);

			// Call the image upload API
			const response = await fetch('/api/image-upload', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
			}

			// Parse the response
			const result = await response.json();

			if (!result.success || !result.image) {
				throw new Error('No image data received from server');
			}

			// Add to working images
			myState.addWorkingImage(result.image);

			// Set as primary if it's the first image
			if (images.length === 0) {
				myState.setPrimaryImage(result.image.id);
			}

			toast.success('Image uploaded successfully');
		} catch (error) {
			console.error('Upload error:', error);
			toast.error('Failed to upload image');
		} finally {
			isUploading = false;
		}
	};
	const handleRemove = async (imageId: number) => {
		if (images.length <= MIN_IMAGES_PER_ENTRY) {
			toast.error(`Minimum ${MIN_IMAGES_PER_ENTRY} image required`);
			return;
		}

		try {
			// Remove from local state
			myState.removeWorkingImage(imageId);

			// If this was the primary image, set new primary
			if (primaryImageId === imageId) {
				const remainingImages = images.filter((img) => img && img.id !== imageId);
				if (remainingImages.length > 0 && remainingImages[0]) {
					myState.setPrimaryImage(remainingImages[0].id);
				}
			}

			toast.success('Image removed');
		} catch (error) {
			console.error('Remove error:', error);
			toast.error('Failed to remove image');
		}
	};

	const handleSetPrimary = (imageId: number) => {
		myState.setPrimaryImage(imageId);
		toast.success('Primary image updated');
	};
</script>

<div class="space-y-4">
	<!-- Header with status and add button -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<Label class="text-base font-medium">Images ({images.length}/{MAX_IMAGES_UI_LIMIT})</Label>
			{#if !hasMinImages}
				<Badge variant="destructive" class="text-xs">
					<AlertCircle class="mr-1 h-3 w-3" />
					At least {MIN_IMAGES_PER_ENTRY} required
				</Badge>
			{/if}
		</div>

		{#if canAddMore}
			<Button size="sm" onclick={handleAddImage} disabled={isUploading} variant="outline">
				<Upload class="mr-2 h-4 w-4" />
				{isUploading ? 'Uploading...' : 'Add Image'}
			</Button>
		{/if}
	</div>

	<!-- Images grid or empty state -->
	{#if images.length === 0}
		<div class="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center">
			<Upload class="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
			<p class="mb-4 text-sm text-muted-foreground">No images uploaded yet</p>
			<Button onclick={handleAddImage} disabled={isUploading}>
				<Upload class="mr-2 h-4 w-4" />
				{isUploading ? 'Uploading...' : 'Upload First Image'}
			</Button>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
			{#each images.filter((img) => img !== null) as image (image.id)}
				<div class="group relative overflow-hidden rounded-lg border bg-card">
					<!-- Image -->
					<div class="relative aspect-square">
						<img src={image.cloudURL} alt={image.originalFileName} class="h-full w-full object-cover" />

						<!-- Primary indicator -->
						{#if image.id === primaryImageId}
							<div class="absolute left-2 top-2 rounded-full bg-yellow-500 p-1 text-white">
								<Star class="h-4 w-4 fill-current" />
							</div>
						{/if}

						<!-- Hover actions -->
						<div
							class="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
						>
							{#if image.id !== primaryImageId}
								<Button size="sm" variant="secondary" onclick={() => handleSetPrimary(image.id)}>
									<Star class="mr-1 h-3 w-3" />
									Set Primary
								</Button>
							{/if}

							{#if images.length > MIN_IMAGES_PER_ENTRY}
								<Button size="sm" variant="destructive" onclick={() => handleRemove(image.id)}>
									<X class="mr-1 h-3 w-3" />
									Remove
								</Button>
							{/if}
						</div>
					</div>

					<!-- Image info -->
					<div class="p-3">
						<p class="truncate text-sm font-medium">{image.originalFileName}</p>
						{#if image.id === primaryImageId}
							<p class="text-xs font-medium text-yellow-600">Primary Image</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>

		{#if images.length > MIN_IMAGES_PER_ENTRY}
			<!-- Instructions -->
			<div class="space-y-1 text-sm text-muted-foreground">
				<p>• The primary image (starred) will be in the catalogue</p>
				<p>• Hover over image to set a primary or remove image</p>
			</div>
		{/if}
	{/if}
</div>

<!-- Hidden file input -->
<input bind:this={fileInputRef} type="file" accept="image/*" onchange={handleFileSelect} class="hidden" />
