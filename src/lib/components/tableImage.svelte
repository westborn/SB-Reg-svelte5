<script lang="ts">
	type Props = {
		path: string;
		entryId?: number;
	};

	import OptimisedImage from '$lib/components/optimised-image.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import Star from 'lucide-svelte/icons/star';
	import type { CurrentImage } from '$lib/components/server/registrationDB';

	let { path, entryId }: Props = $props();

	let showLargeImage = $state(false);
	let images = $state<CurrentImage[]>([]);
	let primaryImageId = $state<number | null>(null);
	let isLoading = $state(false);

	// Carousel API state
	let api = $state<any>(null);
	let current = $state(0);
	let count = $state(0);

	function setCarouselApi(carouselApi: any) {
		api = carouselApi;
	}

	$effect(() => {
		if (!api) return;

		count = api.scrollSnapList().length;
		current = api.selectedScrollSnap();

		api.on('select', () => {
			current = api.selectedScrollSnap();
		});
	});
	const processedImages = $derived.by(() => {
		const validImages = images.filter((img) => img !== null);

		if (!validImages.length || !primaryImageId) {
			return validImages.map((img) => ({ ...img, isPrimary: false }));
		}

		// Find primary image
		const primaryImg = validImages.find((img) => img.id === primaryImageId);
		if (!primaryImg) {
			return validImages.map((img) => ({ ...img, isPrimary: false }));
		}

		// Mark primary image and put it first
		const markedPrimaryImg = { ...primaryImg, isPrimary: true };
		const otherImages = validImages
			.filter((img) => img.id !== primaryImageId)
			.map((img) => ({ ...img, isPrimary: false }));

		return [markedPrimaryImg, ...otherImages];
	});

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

				// Set current image to primary image if it exists (using carousel API)
				if (primaryImageId && images.length > 0 && api) {
					const primaryIndex = images.findIndex((img) => img && img.id === primaryImageId);
					if (primaryIndex !== -1) {
						api.scrollTo(primaryIndex);
					}
				}
			} else {
				console.error('Failed to load images:', response.statusText);
				// Fallback to single image
				images = [];
			}
		} catch (error) {
			console.error('Error loading images:', error);
			// Fallback to single image
			images = [];
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
			{:else if processedImages.length > 0}
				<!-- Carousel implementation -->
				<div class="space-y-4">
					<Carousel.Root
						setApi={setCarouselApi}
						opts={{
							align: 'center',
							loop: true
						}}
						class="mx-auto max-w-lg"
					>
						<Carousel.Content>
							{#each processedImages as image, index}
								<Carousel.Item class="relative">
									<OptimisedImage
										path={image.cloudURL}
										alt={image.originalFileName || 'Entry image'}
										width={512}
										height={0}
										class="rounded"
									/>
									<!-- Primary Image Star Indicator -->
									{#if image.isPrimary}
										<div class="absolute right-2 top-2 rounded-full bg-yellow-500 p-1 text-white shadow-md">
											<Star class="h-3 w-3 fill-current" />
										</div>
									{/if}
								</Carousel.Item>
							{/each}
						</Carousel.Content>

						<!-- Navigation Arrows (only show if multiple images) -->
						{#if processedImages.length > 1}
							<Carousel.Previous class="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 bg-white/80 hover:bg-white" />
							<Carousel.Next class="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 bg-white/80 hover:bg-white" />
						{/if}
					</Carousel.Root>

					<!-- Dot Navigation (only show if multiple images) -->
					{#if processedImages.length > 1}
						<div class="flex justify-center gap-1">
							{#each Array.from({ length: count }) as _, index}
								<button
									type="button"
									onclick={() => api?.scrollTo(index)}
									class="h-2 w-2 rounded-full transition-colors {index === current
										? 'bg-primary'
										: 'bg-muted-foreground/50 hover:bg-muted-foreground/80'}"
									aria-label={`Go to image ${index + 1}`}
								></button>
							{/each}
						</div>
					{/if}

					<!-- Image info -->
					{#if processedImages[current]?.originalFileName}
						<p class="text-center text-sm font-medium">{processedImages[current].originalFileName}</p>
					{/if}
				</div>
			{:else}
				<!-- Fallback to single image -->
				<OptimisedImage {path} alt="alt" width={460} height={0} class="rounded" />
			{/if}
		</Dialog.Content>
	</Dialog.Root>
{/if}
