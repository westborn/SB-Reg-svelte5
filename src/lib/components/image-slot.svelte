<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { OptimisedImage } from '$lib/components';
	import { getRegisterState } from '$lib/context.svelte';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import ImageIcon from 'lucide-svelte/icons/image';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import Star from 'lucide-svelte/icons/star';
	import StarOff from 'lucide-svelte/icons/star-off';
	import Upload from 'lucide-svelte/icons/upload';
	import type { CurrentImage } from '$lib/components/server/registrationDB';

	type Props = {
		image?: CurrentImage | null;
		isPrimary?: boolean;
		isEmpty?: boolean;
		isLoading?: boolean;
		onUpload?: () => void;
		onRemove?: (imageId: number) => void;
		onSetPrimary?: (imageId: number) => void;
		onReplace?: (imageId: number) => void;
		showRemove?: boolean;
		showSetPrimary?: boolean;
	};

	let {
		image = null,
		isPrimary = false,
		isEmpty = false,
		isLoading = false,
		onUpload,
		onRemove,
		onSetPrimary,
		onReplace,
		showRemove = true,
		showSetPrimary = true
	}: Props = $props();

	let myState = getRegisterState();

	const handleRemove = () => {
		if (image?.id && onRemove) {
			onRemove(image.id);
		}
	};

	const handleSetPrimary = () => {
		if (image?.id && onSetPrimary) {
			onSetPrimary(image.id);
		}
	};

	const handleReplace = () => {
		if (image?.id && onReplace) {
			onReplace(image.id);
		}
	};

	const handleUpload = () => {
		if (onUpload) {
			onUpload();
		}
	};
</script>

<div
	class="group relative aspect-square w-full overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 transition-colors hover:bg-muted/20"
>
	{#if isLoading}
		<!-- Loading State -->
		<div class="flex h-full items-center justify-center">
			<LoaderCircle class="h-8 w-8 animate-spin text-muted-foreground" />
		</div>
	{:else if isEmpty || !image}
		<!-- Empty State -->
		<button
			class="flex h-full w-full flex-col items-center justify-center transition-colors hover:bg-muted/30"
			onclick={handleUpload}
			type="button"
		>
			<Upload class="mb-2 h-8 w-8 text-muted-foreground" />
			<span class="text-sm text-muted-foreground">Add Image</span>
		</button>
	{:else}
		<!-- Image Display -->
		<div class="relative h-full w-full">
			<OptimisedImage
				path={image.cloudURL}
				alt={image.originalFileName || 'Entry image'}
				width={200}
				height={200}
				class="h-full w-full object-cover"
			/>

			<!-- Primary Badge -->
			{#if isPrimary}
				<Badge class="absolute left-2 top-2 bg-primary text-primary-foreground">
					<Star class="mr-1 h-3 w-3" />
					Primary
				</Badge>
			{/if}

			<!-- Action Buttons Overlay -->
			<div
				class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
			>
				<div class="flex flex-col gap-2">
					<!-- Set as Primary Button (only show if not already primary) -->
					{#if !isPrimary && showSetPrimary}
						<Button size="sm" variant="secondary" onclick={handleSetPrimary} class="text-xs">
							<StarOff class="mr-1 h-3 w-3" />
							Set Primary
						</Button>
					{/if}

					<!-- Replace Button -->
					<Button size="sm" variant="secondary" onclick={handleReplace} class="text-xs">
						<Upload class="mr-1 h-3 w-3" />
						Replace
					</Button>

					<!-- Remove Button (only show if allowed) -->
					{#if showRemove}
						<Button size="sm" variant="destructive" onclick={handleRemove} class="text-xs">
							<Trash2 class="mr-1 h-3 w-3" />
							Remove
						</Button>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
