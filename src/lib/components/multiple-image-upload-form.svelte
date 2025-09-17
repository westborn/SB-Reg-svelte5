<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { ImageSlot } from '$lib/components';
	import { getRegisterState } from '$lib/context.svelte';
	import { MAX_IMAGES_UI_LIMIT, MIN_IMAGES_PER_ENTRY } from '$lib/constants';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/stores';
	import Upload from 'lucide-svelte/icons/upload';
	import AlertCircle from 'lucide-svelte/icons/circle-alert';
	import type { CurrentImage } from '$lib/components/server/registrationDB';

	type Props = {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		triggerText?: string;
		title?: string;
		description?: string;
	};

	let {
		open = $bindable(false),
		onOpenChange,
		triggerText = 'Upload Images',
		title = 'Upload Images',
		description = `Upload up to ${MAX_IMAGES_UI_LIMIT} images for your entry`
	}: Props = $props();

	let myState = getRegisterState();
	let fileInputRef: HTMLInputElement | undefined = $state();
	let uploadingIndex: number | null = $state(null);
	let replacingImageId: number | null = $state(null);

	// Reactive state for images display
	const images = $derived(myState.workingImages || []);
	const primaryImageId = $derived(myState.primaryImageId);
	const canAddMore = $derived(images.length < MAX_IMAGES_UI_LIMIT);
	const hasMinImages = $derived(images.length >= MIN_IMAGES_PER_ENTRY);

	// Create array of 3 slots for UI
	const imageSlots = $derived(() => {
		const slots: Array<{ image: CurrentImage | null; index: number }> = [];
		for (let i = 0; i < MAX_IMAGES_UI_LIMIT; i++) {
			slots.push({
				image: images[i] || null,
				index: i
			});
		}
		return slots;
	});

	const handleFileSelect = (event: Event) => {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		if (replacingImageId) {
			// Replace existing image
			handleImageReplace(file, replacingImageId);
		} else {
			// Add new image
			handleImageUpload(file);
		}

		// Clear the input
		target.value = '';
		replacingImageId = null;
	};

	const handleImageUpload = async (file: File) => {
		if (!canAddMore) {
			toast.error(`Maximum ${MAX_IMAGES_UI_LIMIT} images allowed`);
			return;
		}

		const newIndex = images.length;
		uploadingIndex = newIndex;

		try {
			const formData = new FormData();
			formData.append('file', file);

			const response = await fetch('/api/image-upload', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				throw new Error('Upload failed');
			}

			const result = await response.json();

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
			uploadingIndex = null;
		}
	};

	const handleImageReplace = async (file: File, imageId: number) => {
		try {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('replaceImageId', imageId.toString());

			const response = await fetch('/api/image-upload', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				throw new Error('Replace failed');
			}

			const result = await response.json();

			// Replace in working images
			const imageIndex = images.findIndex((img) => img && img.id === imageId);
			if (imageIndex >= 0) {
				myState.workingImages[imageIndex] = result.image;

				// Update primary if this was the primary image
				if (primaryImageId === imageId) {
					myState.setPrimaryImage(result.image.id);
				}
			}

			toast.success('Image replaced successfully');
		} catch (error) {
			console.error('Replace error:', error);
			toast.error('Failed to replace image');
		}
	};

	const handleUpload = () => {
		replacingImageId = null;
		fileInputRef?.click();
	};

	const handleRemove = async (imageId: number) => {
		if (images.length <= MIN_IMAGES_PER_ENTRY) {
			toast.error(`Minimum ${MIN_IMAGES_PER_ENTRY} image required`);
			return;
		}

		try {
			myState.removeWorkingImage(imageId);

			// If this was the primary image, set new primary
			if (primaryImageId === imageId && images.length > 0) {
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

	const handleReplace = (imageId: number) => {
		replacingImageId = imageId;
		fileInputRef?.click();
	};

	const handleOpenChange = (newOpen: boolean) => {
		open = newOpen;
		if (onOpenChange) {
			onOpenChange(newOpen);
		}
	};
</script>

<Dialog.Root onOpenChange={handleOpenChange}>
	<Dialog.Trigger class="w-full">
		<Button variant="default">
			<Upload class="mr-2 h-4 w-4" />
			{triggerText}
		</Button>
	</Dialog.Trigger>

	<Dialog.Content class="max-h-[90vh] max-w-2xl overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
			<Dialog.Description>{description}</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-6">
			<!-- Upload Status -->
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<Label>Images ({images.length}/{MAX_IMAGES_UI_LIMIT})</Label>
					{#if !hasMinImages}
						<Badge variant="destructive" class="text-xs">
							<AlertCircle class="mr-1 h-3 w-3" />
							Minimum {MIN_IMAGES_PER_ENTRY} required
						</Badge>
					{/if}
				</div>
				{#if canAddMore}
					<Button size="sm" onclick={handleUpload}>
						<Upload class="mr-2 h-4 w-4" />
						Add Image
					</Button>
				{/if}
			</div>

			<!-- Image Grid -->
			<div class="grid grid-cols-3 gap-4">
				{#each imageSlots() as slot, index (slot.index)}
					<ImageSlot
						image={slot.image}
						isPrimary={slot.image?.id === primaryImageId}
						isEmpty={!slot.image}
						isLoading={uploadingIndex === index}
						onUpload={canAddMore ? handleUpload : undefined}
						onRemove={handleRemove}
						onSetPrimary={handleSetPrimary}
						onReplace={handleReplace}
						showRemove={images.length > MIN_IMAGES_PER_ENTRY}
						showSetPrimary={images.length > 1}
					/>
				{/each}
			</div>

			<!-- Instructions -->
			<div class="space-y-1 text-sm text-muted-foreground">
				<p>• Upload up to {MAX_IMAGES_UI_LIMIT} images</p>
				<p>• First image will be set as primary automatically</p>
				<p>• Click "Set Primary" to change which image represents your entry</p>
				<p>• Hover over images to see action buttons</p>
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => handleOpenChange(false)}>Done</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Hidden file input -->
<input bind:this={fileInputRef} type="file" accept="image/*" onchange={handleFileSelect} class="hidden" />
