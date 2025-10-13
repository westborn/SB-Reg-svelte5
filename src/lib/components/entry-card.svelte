<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import { OptimisedImage } from '$lib/components';
	import { convertToDollars } from '$lib/utils.js';
	import Star from 'lucide-svelte/icons/star';

	interface Props {
		entryItem: any;
		showActions?: boolean;
		variant?: 'default' | 'accordion';
		children?: any;
	}

	let { entryItem, showActions = false, variant = 'default', children }: Props = $props();

	// Prepare images array with primary image handling
	const images = $derived.by(() => {
		const imagesList = entryItem.images || [];

		if (entryItem.primaryImage) {
			const primaryImageUrl = entryItem.primaryImage.image.cloudURL;

			// Find the primary image
			const primaryImg = imagesList.find((img: any) => img.cloudURL === primaryImageUrl);

			if (primaryImg) {
				// Create primary image with isPrimary flag
				const markedPrimaryImg = { ...primaryImg, isPrimary: true };

				// Get other images without the primary one
				const otherImages = imagesList
					.filter((img: any) => img.cloudURL !== primaryImageUrl)
					.map((img: any) => ({ ...img, isPrimary: false }));

				// Return primary image first, followed by others
				return [markedPrimaryImg, ...otherImages];
			}
		}

		// If no primary image, return all images without isPrimary flag
		return imagesList.map((img: any) => ({ ...img, isPrimary: false }));
	});

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
</script>

<Card.Root class="mb-4">
	<Card.Title class="pl-4 pt-4">{entryItem.title}</Card.Title>
	<Card.Content class="p-0 pl-4 text-sm">
		<p class="text-xs">({entryItem.inOrOut})</p>
		<p>{entryItem.description}</p>
		<div class="grid grid-cols-2">
			<div class="group relative flex flex-col items-center justify-center py-2">
				{#if images.length > 0}
					<!-- Multi-Image Carousel -->
					<Carousel.Root
						setApi={setCarouselApi}
						opts={{
							align: 'center',
							loop: true
						}}
						class="h-40 w-40"
					>
						<Carousel.Content class="h-40">
							{#each images as image, index}
								<Carousel.Item class="relative">
									<OptimisedImage
										path={image.cloudURL}
										alt={`Image ${index + 1} of ${images.length}`}
										width={160}
										height={160}
										class="h-40 w-40 rounded object-cover {entryItem.sold ? 'opacity-60 grayscale' : ''}"
									/>
									<!-- Sold Indicator Overlay -->
									{#if entryItem.sold}
										<div class="absolute inset-0 flex items-center justify-center">
											<div class="rounded-md bg-red-600 px-3 py-1 text-sm font-bold text-white shadow-lg">SOLD</div>
										</div>
									{/if}
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
						{#if images.length > 1}
							<Carousel.Previous
								class="absolute left-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 group-hover:opacity-70"
							/>
							<Carousel.Next
								class="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 group-hover:opacity-70"
							/>
						{/if}
					</Carousel.Root>

					<!-- Dot Navigation (only show if multiple images) -->
					{#if images.length > 1}
						<div class="mt-2 flex gap-1">
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
				{:else}
					<!-- No image placeholder -->
					<div class="relative">
						<OptimisedImage
							path="/dummy_160x160_ffffff_cccccc.png"
							alt="No Image"
							width={160}
							height={160}
							class="h-40 w-40 overflow-hidden rounded object-contain {entryItem.sold ? 'opacity-60 grayscale' : ''}"
						/>
						{#if entryItem.sold}
							<div class="absolute inset-0 flex items-center justify-center">
								<div class="rounded-md bg-red-600 px-3 py-1 text-sm font-bold text-white shadow-lg">SOLD</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>
			<div class="flex flex-col {variant === 'accordion' ? 'mx-auto' : ''}">
				<p class="mt-3 text-lg">{convertToDollars(entryItem.price)}</p>
				<p>{entryItem.material}</p>
				<p>{entryItem?.specialRequirements}</p>
				<p>({entryItem.dimensions})</p>
			</div>
		</div>
		{#if showActions}
			<div class="flex justify-around py-2">
				{@render children?.()}
			</div>
		{/if}
	</Card.Content>
</Card.Root>
