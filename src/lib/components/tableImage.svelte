<script lang="ts">
	type Props = {
		path: string;
		entryId?: number;
	};

	import OptimisedImage from '$lib/components/optimised-image.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import Star from 'lucide-svelte/icons/star';
	import Camera from 'lucide-svelte/icons/camera';
	import type { CurrentImage } from '$lib/components/server/registrationDB';

	let { path, entryId }: Props = $props();

	let showLargeImage = $state(false);
	let images = $state<CurrentImage[]>([]);
	let primaryImageId = $state<number | null>(null);
	let currentImageIndex = $state(0);
	let isLoading = $state(false);
	let hasMultipleImages = $state(false);

	// Load images when dialog opens
	const loadImages = async () => {
		if (!entryId || isLoading) return;

		isLoading = true;
		try {
			const response = await fetch(`/api/entry-images?entryId=${entryId}`);
			if (response.ok) {
				const data = await response.json();
				images = (data.images || []).filter(Boolean); // Filter out null images
				primaryImageId = data.primaryImageId;
				hasMultipleImages = images.length > 1;

				// Set current image to primary image if it exists
				if (primaryImageId && images.length > 0) {
					const primaryIndex = images.findIndex((img) => img && img.id === primaryImageId);
					if (primaryIndex !== -1) {
						currentImageIndex = primaryIndex;
					}
				}
			} else {
				console.error('Failed to load images:', response.statusText);
				// Fallback to single image
				images = [];
				hasMultipleImages = false;
			}
		} catch (error) {
			console.error('Error loading images:', error);
			// Fallback to single image
			images = [];
			hasMultipleImages = false;
		} finally {
			isLoading = false;
		}
	};

	const handleImageClick = async () => {
		showLargeImage = true;
		if (entryId) {
			await loadImages();
		}
	};

	const nextImage = () => {
		if (images.length > 1) {
			currentImageIndex = (currentImageIndex + 1) % images.length;
		}
	};

	const prevImage = () => {
		if (images.length > 1) {
			currentImageIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
		}
	};

	const currentImage = $derived(images[currentImageIndex] || null);
</script>

<!-- all cell contents need to be wrapped in <span> tags -->
<span class="relative">
	<button onclick={handleImageClick}>
		<OptimisedImage
			{path}
			alt="alt"
			width={40}
			height={40}
			class="h-20 w-20 overflow-hidden rounded object-contain"
		/></button
	>

	<!-- Multiple images indicator (only show after we've loaded images and confirmed multiple) -->
	{#if entryId && hasMultipleImages && images.length > 1}
		<div class="absolute right-1 top-1 rounded-full bg-black bg-opacity-70 p-1">
			<Camera class="h-3 w-3 text-white" />
		</div>
	{/if}
</span>

{#if showLargeImage}
	<Dialog.Root bind:open={showLargeImage}>
		<Dialog.Trigger>Open</Dialog.Trigger>
		<Dialog.Content class="overflow-auto sm:max-h-[800px] sm:max-w-[600px]">
			{#if isLoading}
				<div class="flex h-96 items-center justify-center">
					<div class="text-center">
						<div
							class="mb-2 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"
						></div>
						<p class="text-muted-foreground">Loading images...</p>
					</div>
				</div>
			{:else if images.length > 0 && currentImage}
				<!-- Multiple images carousel -->
				<div class="space-y-4">
					<!-- Image display -->
					<div class="relative">
						<OptimisedImage
							path={currentImage.cloudURL}
							alt={currentImage.originalFileName || 'Entry image'}
							width={560}
							height={0}
							class="rounded"
						/>

						<!-- Primary badge -->
						{#if currentImage.id === primaryImageId}
							<Badge class="absolute left-2 top-2 bg-primary text-primary-foreground">
								<Star class="mr-1 h-3 w-3" />
								Primary
							</Badge>
						{/if}

						<!-- Navigation buttons -->
						{#if images.length > 1}
							<Button
								variant="secondary"
								size="icon"
								class="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
								onclick={prevImage}
							>
								<ChevronLeft class="h-4 w-4" />
							</Button>
							<Button
								variant="secondary"
								size="icon"
								class="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
								onclick={nextImage}
							>
								<ChevronRight class="h-4 w-4" />
							</Button>
						{/if}
					</div>

					<!-- Image info and counter -->
					<div class="space-y-2">
						{#if images.length > 1}
							<div class="text-center text-sm text-muted-foreground">
								Image {currentImageIndex + 1} of {images.length}
							</div>
						{/if}

						{#if currentImage.originalFileName}
							<p class="text-center text-sm font-medium">{currentImage.originalFileName}</p>
						{/if}
					</div>

					<!-- Thumbnail navigation for multiple images -->
					{#if images.length > 1}
						<div class="flex justify-center space-x-2">
							{#each images as image, index (image?.id || index)}
								{#if image}
									<button
										class="relative h-16 w-16 overflow-hidden rounded border-2 transition-all {index ===
										currentImageIndex
											? 'border-primary'
											: 'border-muted hover:border-muted-foreground'}"
										onclick={() => (currentImageIndex = index)}
									>
										<OptimisedImage
											path={image.cloudURL}
											alt={image.originalFileName || 'Thumbnail'}
											width={64}
											height={64}
											class="h-full w-full object-cover"
										/>
										{#if image.id === primaryImageId}
											<div class="absolute right-0 top-0 rounded-bl bg-primary p-0.5">
												<Star class="h-2 w-2 text-primary-foreground" />
											</div>
										{/if}
									</button>
								{/if}
							{/each}
						</div>
					{/if}
				</div>
			{:else}
				<!-- Fallback to single image -->
				<OptimisedImage {path} alt="alt" width={460} height={0} class="rounded" />
			{/if}
		</Dialog.Content>
	</Dialog.Root>
{/if}
