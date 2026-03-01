import type { CurrentImage } from '$lib/components/server/registrationDB';
import { MIN_IMAGES_PER_ENTRY } from '$lib/constants';

/**
 * Maps images array with primary image designation.
 *
 * @param images - Array of images to process
 * @param primaryImageId - ID of the primary image
 * @returns Array of images with isPrimary flag added
 *
 * @example
 * const imagesWithPrimary = getImagesWithPrimary(images, 5);
 * // Returns: [{ id: 5, isPrimary: true, ... }, { id: 6, isPrimary: false, ... }]
 */
export function getImagesWithPrimary(images: CurrentImage[], primaryImageId: number | null) {
	return images.map((image) => ({
		...image,
		isPrimary: image?.id === primaryImageId
	}));
}

/**
 * Validates that a given image ID exists in the images array.
 *
 * @param imageId - ID of the image to validate
 * @param images - Array of images to search
 * @returns True if the image exists, false otherwise
 *
 * @example
 * const isValid = validatePrimaryImage(5, images);
 * if (!isValid) throw new Error('Image not found');
 */
export function validatePrimaryImage(imageId: number, images: CurrentImage[]): boolean {
	return images.some((img) => img?.id === imageId);
}

/**
 * Gets the ID of the first image as the default primary image.
 *
 * @param images - Array of images
 * @returns ID of the first image, or null if no images exist
 *
 * @example
 * const defaultPrimary = getDefaultPrimaryImage(images);
 * // Returns: 5 (ID of first image) or null if empty array
 */
export function getDefaultPrimaryImage(images: CurrentImage[]): number | null {
	return images.length > 0 && images[0]?.id ? images[0].id : null;
}

/**
 * Checks if an image can be removed, considering minimum image requirements.
 *
 * @param imageId - ID of the image to remove (currently unused but available for future validation)
 * @param images - Array of current images
 * @param primaryImageId - ID of the current primary image (currently unused but available for future logic)
 * @returns Object with canRemove boolean and optional reason string
 *
 * @example
 * const { canRemove, reason } = canRemoveImage(5, images, 5);
 * if (!canRemove) {
 *   toast.error(reason);
 * }
 */
export function canRemoveImage(
	imageId: number,
	images: CurrentImage[],
	primaryImageId: number | null
): { canRemove: boolean; reason?: string } {
	if (images.length <= MIN_IMAGES_PER_ENTRY) {
		return { canRemove: false, reason: 'Cannot remove the last remaining image' };
	}
	return { canRemove: true };
}

/**
 * Determines the new primary image ID after removing an image.
 * If removing the primary image, returns the ID of the first remaining image.
 * Otherwise, returns the current primary image ID unchanged.
 *
 * @param imageIdToRemove - ID of the image being removed
 * @param images - Array of current images
 * @param currentPrimaryId - Current primary image ID
 * @returns New primary image ID
 *
 * @example
 * const newPrimary = getNewPrimaryAfterRemoval(5, images, 5);
 * // If removing primary image 5, returns ID of first remaining image
 */
export function getNewPrimaryAfterRemoval(
	imageIdToRemove: number,
	images: CurrentImage[],
	currentPrimaryId: number | null
): number | null {
	// If not removing the primary image, keep current primary
	if (currentPrimaryId !== imageIdToRemove) {
		return currentPrimaryId;
	}

	// Get remaining images after removal
	const remainingImages = images.filter((img) => img?.id !== imageIdToRemove);

	// Return ID of first remaining image
	return remainingImages.length > 0 && remainingImages[0]?.id ? remainingImages[0].id : null;
}
