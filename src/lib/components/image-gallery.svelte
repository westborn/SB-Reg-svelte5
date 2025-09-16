<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { OptimisedImage } from '$lib/components';
	import Star from 'lucide-svelte/icons/star';
	import type { CurrentImage } from '$lib/components/server/registrationDB';

	type Props = {
		images: CurrentImage[];
		primaryImageId?: number | null;
		columns?: 1 | 2 | 3 | 4;
		showPrimaryBadge?: boolean;
		className?: string;
	};

	let { images = [], primaryImageId = null, columns = 3, showPrimaryBadge = true, className = '' }: Props = $props();

	// Sort images to show primary first if it exists
	const sortedImages = $derived(() => {
		if (!images || images.length === 0) return [];
		if (!primaryImageId) return images;

		const primaryImage = images.find((img) => img?.id === primaryImageId);
		const otherImages = images.filter((img) => img?.id !== primaryImageId);

		return primaryImage ? [primaryImage, ...otherImages] : images;
	});

	const gridClass = $derived(() => {
		const baseClass = 'grid gap-4';
		const columnClass = {
			1: 'grid-cols-1',
			2: 'grid-cols-1 sm:grid-cols-2',
			3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
			4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
		}[columns];

		return `${baseClass} ${columnClass} ${className}`;
	});
</script>

{#if sortedImages().length === 0}
	<div class="py-8 text-center text-muted-foreground">
		<p>No images available</p>
	</div>
{:else}
	<div class={gridClass}>
		{#each sortedImages() as image (image?.id)}
			{#if image}
				<div class="group relative">
					<div class="aspect-square w-full overflow-hidden rounded-lg border">
						<OptimisedImage
							path={image.cloudURL || ''}
							alt={image.originalFileName || 'Entry image'}
							width={300}
							height={300}
							class="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
						/>
					</div>

					{#if showPrimaryBadge && image.id === primaryImageId}
						<Badge class="absolute left-2 top-2 bg-primary text-primary-foreground shadow-lg">
							<Star class="mr-1 h-3 w-3" />
							Primary
						</Badge>
					{/if}
				</div>
			{/if}
		{/each}
	</div>
{/if}
