<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
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
</script>

<Card.Root class="mb-4">
	<Card.Title class="pl-4 pt-4 capitalize">{entryItem.title}</Card.Title>
	<Card.Content class="p-0 pl-4 text-sm">
		<p class="text-xs">({entryItem.inOrOut})</p>
		<p>{entryItem.description}</p>
		<div class="grid grid-cols-2">
			<div class="relative flex items-center justify-around py-2">
				{#if variant === 'accordion' && entryItem.primaryImage}
					<!-- Show primary image with star indicator -->
					<div class="relative">
						<OptimisedImage
							path={entryItem.primaryImage.image.cloudURL}
							alt="Primary Image"
							width={160}
							height={160}
							class="h-40 w-40 overflow-hidden rounded object-cover"
						/>
						<div class="absolute left-2 top-2 rounded-full bg-yellow-500 p-1 text-white">
							<Star class="h-3 w-3 fill-current" />
						</div>
					</div>
				{:else if entryItem?.images?.[0]?.cloudURL}
					<!-- Show first image with multiple image indicator -->
					<OptimisedImage
						path={entryItem.images[0].cloudURL}
						alt="Current Image"
						width={160}
						height={160}
						class="h-40 w-40 overflow-hidden rounded object-contain"
					/>
					{#if entryItem.images.length > 1}
						<div class="absolute right-1 top-1 rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
							+{entryItem.images.length - 1} more
						</div>
					{/if}
				{:else}
					<!-- No image placeholder -->
					<OptimisedImage
						path="/dummy_160x160_ffffff_cccccc.png"
						alt="No Image"
						width={160}
						height={160}
						class="h-40 w-40 overflow-hidden rounded object-contain"
					/>
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
