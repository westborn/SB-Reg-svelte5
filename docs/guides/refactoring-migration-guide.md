# Refactoring Migration Guide

This guide documents the pattern changes and best practices established through the 2026 refactoring effort. Use this as a reference when implementing new features or reviewing code.

## Table of Contents

1. [Old Patterns vs New Patterns](#old-patterns-vs-new-patterns)
2. [Migration Checklist for New Features](#migration-checklist-for-new-features)
3. [Code Review Checklist](#code-review-checklist)
4. [Common Pitfalls](#common-pitfalls)
5. [Examples of Properly Refactored Code](#examples-of-properly-refactored-code)

---

## Old Patterns vs New Patterns

### Server Actions

#### ❌ OLD PATTERN

```typescript
export const actions = {
	myAction: async (event) => {
		const formData = await event.request.formData();
		const artistEmail = event.locals.user.email;

		try {
			const result = await prisma.artistTable.update({
				where: { email: artistEmail },
				data: { firstName: formData.get('firstName') }
			});
			console.log('Updated artist:', result);
			return { success: true };
		} catch (err) {
			console.error('Failed to update:', err);
			return fail(500, { message: 'Something went wrong' });
		}
	}
};
```

#### ✅ NEW PATTERN

```typescript
import { getArtistEmail, returnWithUpdatedSubmission } from '$lib/server/helpers';
import { updateArtist } from '$lib/components/server/registrationDB';
import { GENERIC_ERROR_MESSAGE } from '$lib/constants';

export const actions = {
	myAction: async (event) => {
		const { user } = await event.locals.V1safeGetSession();
		const artistEmail = getArtistEmail(user);

		const formValidationResult = await superValidate(event, zod(artistSchemaUI));
		if (!formValidationResult.valid) {
			return message(formValidationResult, 'Form validation failed', { status: 400 });
		}

		try {
			await updateArtist(artistId, formValidationResult.data);
			const updatedSubmission = await getSubmission(user);
			return returnWithUpdatedSubmission(formValidationResult, updatedSubmission);
		} catch (error) {
			return fail(500, { message: GENERIC_ERROR_MESSAGE });
		}
	}
};
```

**Key Changes:**

- Use helper functions from `src/lib/server/helpers.ts`
- Use database helpers from `registrationDB.ts`
- Use constants instead of hardcoded strings
- No console.log or console.error
- Consistent error responses
- Return standardized response format

### Database Operations

#### ❌ OLD PATTERN

```typescript
// Inline database operations in route handlers
const result = await prisma.entryTable.update({
	where: { id: entryId },
	data: {
		title: formData.title,
		price: formData.price,
		material: formData.material
	}
});
```

#### ✅ NEW PATTERN

```typescript
// Use database helper functions
import { updateEntry } from '$lib/components/server/registrationDB';

await updateEntry(entryId, {
	title: formData.title,
	price: formData.price,
	material: formData.material
});
```

**Key Changes:**

- All database operations centralized in `registrationDB.ts`
- Reusable helper functions with JSDoc
- Consistent error handling
- Easier to test and maintain

### Form ID Patterns

#### ❌ OLD PATTERN

```typescript
// Inconsistent ID usage
let form = superForm(myState.artistForm, {
	id: 'artistCreateForm' // Double quotes
	// ...
});

let form = superForm(myState.entryForm, {
	id: 'entryUpdateForm' // Static ID for dynamic form
	// ...
});
```

#### ✅ NEW PATTERN

```typescript
// Static forms use single quotes
let form = superForm(myState.artistForm, {
	id: 'artistCreateForm', // Single quotes for static IDs
	validators: zod4Client(artistSchemaUI)
});

// Dynamic forms use template literals
let form = superForm(myState.entryUpdateForm, {
	id: `entryUpdateForm-${entryId}`, // Template literal for unique IDs
	validators: zod4Client(entrySchemaUI)
});
```

**Key Changes:**

- Single quotes for static form IDs
- Template literals for dynamic form IDs (when multiple instances exist)
- Ensures unique IDs prevent form state conflicts

### Price Handling

#### ❌ OLD PATTERN

```typescript
// Hardcoded calculations
const registrationCost = 20 + entryCount * 20;

// Manual conversion
const displayPrice = `$${(priceInCents / 100).toFixed(2)}`;
```

#### ✅ NEW PATTERN

```typescript
import { calculateRegistrationCost, centsToDisplay } from '$lib/utils';
import { BASE_REGISTRATION_COST, PER_ENTRY_COST } from '$lib/constants';

// Use utility function
const registrationCost = calculateRegistrationCost(entryCount);

// Use conversion function
const displayPrice = centsToDisplay(priceInCents);
```

**Key Changes:**

- Use constants for pricing values
- Use utility functions for calculations
- Centralized logic for consistency

### Image Management

#### ❌ OLD PATTERN

```typescript
// Inline primary image logic
if (images.length > 0) {
	const primaryImage = images.find((img) => img.id === primaryImageId);
	if (!primaryImage) {
		// Set first as primary
		primaryImageId = images[0].id;
	}
}
```

#### ✅ NEW PATTERN

```typescript
import { getDefaultPrimaryImage, validatePrimaryImage } from '$lib/utils/primary-image';

// Use utility functions
if (!validatePrimaryImage(primaryImageId, images)) {
	primaryImageId = getDefaultPrimaryImage(images);
}
```

**Key Changes:**

- Use utility functions from `src/lib/utils/primary-image.ts`
- Consistent validation logic
- Reusable across context and server actions

---

## Migration Checklist for New Features

Use this checklist when implementing new features:

### Server Actions

- [ ] Use `getArtistEmail()` helper for user email resolution
- [ ] Use `returnWithUpdatedSubmission()` for success responses
- [ ] Use database helper functions (not inline Prisma calls)
- [ ] Use constants from `constants.ts` (not hardcoded strings)
- [ ] No `console.log()` or `console.error()` statements
- [ ] Return consistent response format (`{ formValidationResult, updatedSubmission }`)
- [ ] Use `fail()` from SvelteKit for error responses
- [ ] Wrap multi-step operations in transactions

### Forms & Components

- [ ] Use proper form ID convention (static = single quotes, dynamic = template literal)
- [ ] Include `onResult` handler for success/error handling
- [ ] Update context state on success (`myState.submission = ...`)
- [ ] Close dialog on success (`myState.dialogOpen = false`)
- [ ] Use `zod4Client()` adapter for client-side validation
- [ ] Use `toast` for user feedback

### Database Operations

- [ ] Use helper functions from `registrationDB.ts`
- [ ] Add JSDoc comments to new helper functions
- [ ] Export proper TypeScript types using `ThenArg` pattern
- [ ] Include example usage in JSDoc

### Constants & Configuration

- [ ] Add new constants to `constants.ts` (not inline)
- [ ] Document constants in `.github/copilot-instructions.md`
- [ ] Use existing constants where applicable
- [ ] Never hardcode exhibition year (use `EXHIBITION_YEAR`)

### Image Handling

- [ ] Use utility functions from `primary-image.ts`
- [ ] Respect `MAX_IMAGES_UI_LIMIT` and `MIN_IMAGES_PER_ENTRY`
- [ ] Use `getImagesWithPrimary()` for displaying images
- [ ] Validate primary image changes with utilities

---

## Code Review Checklist

Use this checklist when reviewing pull requests:

### ✅ Code Quality

- [ ] No `console.log()` or `console.error()` statements in production code
- [ ] No hardcoded strings that should be constants
- [ ] No inline Prisma calls in route handlers
- [ ] No legacy Svelte 4 patterns (`$:`, `export let`, etc.)
- [ ] Proper TypeScript types (no `any` unless necessary)

### ✅ Patterns & Consistency

- [ ] Server actions use helper functions
- [ ] Database operations use `registrationDB.ts` helpers
- [ ] Forms use proper ID conventions
- [ ] Price handling uses utility functions
- [ ] Image management uses utility functions

### ✅ Documentation

- [ ] New helper functions have JSDoc comments
- [ ] JSDoc includes `@param`, `@returns`, `@throws`, and `@example`
- [ ] Complex logic has explanatory comments
- [ ] New constants documented in copilot instructions

### ✅ Error Handling

- [ ] Consistent error response format
- [ ] User-friendly error messages
- [ ] Database operations wrapped in try/catch
- [ ] Multi-step operations use transactions

### ✅ Testing & Validation

- [ ] Form validation schemas defined in `zod-schemas.ts`
- [ ] Server-side validation before database operations
- [ ] Client-side validation with `zod4Client()`
- [ ] Edge cases handled (empty arrays, null values, etc.)

---

## Common Pitfalls

### 1. Using console.log/console.error in Production

**❌ Don't:**

```typescript
console.log('User data:', userData);
console.error('Database error:', error);
```

**✅ Do:**

```typescript
// No logging in production
// Future: Use structured logging system (Phase 9)
```

### 2. Hardcoding Exhibition Year

**❌ Don't:**

```typescript
const year = '2026';
const isCurrentYear = registrationYear === '2026';
```

**✅ Do:**

```typescript
import { EXHIBITION_YEAR } from '$lib/constants';

const year = EXHIBITION_YEAR;
const isCurrentYear = registrationYear === EXHIBITION_YEAR;
```

### 3. Inline Database Operations

**❌ Don't:**

```typescript
const artist = await prisma.artistTable.update({
	where: { id: artistId },
	data: { phone: newPhone }
});
```

**✅ Do:**

```typescript
import { updateArtist } from '$lib/components/server/registrationDB';
await updateArtist(artistId, { phone: newPhone });
```

### 4. Static Form ID for Dynamic Forms

**❌ Don't:**

```typescript
// Multiple instances of this component exist on the same page
let form = superForm(myState.entryForm, {
	id: 'entryForm' // Will conflict!
});
```

**✅ Do:**

```typescript
let form = superForm(myState.entryForm, {
	id: `entryForm-${entryId}` // Unique ID per instance
});
```

### 5. Manual Price Calculations

**❌ Don't:**

```typescript
const total = 20 + entries.length * 20;
const display = '$' + price / 100;
```

**✅ Do:**

```typescript
import { calculateRegistrationCost, centsToDisplay } from '$lib/utils';
const total = calculateRegistrationCost(entries.length);
const display = centsToDisplay(price);
```

### 6. Forgetting Proxy Email Logic

**❌ Don't:**

```typescript
const { user } = await event.locals.V1safeGetSession();
const artistEmail = user.email; // Wrong for super admins!
```

**✅ Do:**

```typescript
import { getArtistEmail } from '$lib/server/helpers';
const { user } = await event.locals.V1safeGetSession();
const artistEmail = getArtistEmail(user); // Handles proxy
```

### 7. Not Using Transactions for Multi-Step Operations

**❌ Don't:**

```typescript
await prisma.imageTable.delete({ where: { id: imageId } });
await prisma.primaryImageTable.update({ where: { entryId }, data: { imageId: newPrimaryId } });
// If second operation fails, first already succeeded!
```

**✅ Do:**

```typescript
await prisma.$transaction([
	prisma.imageTable.delete({ where: { id: imageId } }),
	prisma.primaryImageTable.update({ where: { entryId }, data: { imageId: newPrimaryId } })
]);
```

---

## Examples of Properly Refactored Code

### Example 1: Server Action with Helper Functions

```typescript
import { getArtistEmail, returnWithUpdatedSubmission } from '$lib/server/helpers';
import { updateArtist, getSubmission } from '$lib/components/server/registrationDB';
import { artistSchemaUI } from '$lib/zod-schemas';
import { GENERIC_ERROR_MESSAGE } from '$lib/constants';

export const actions = {
	artistUpdate: async (event) => {
		const { user } = await event.locals.V1safeGetSession();
		const artistEmail = getArtistEmail(user);

		const formValidationResult = await superValidate(event, zod(artistSchemaUI));
		if (!formValidationResult.valid) {
			return message(formValidationResult, 'Form validation failed', { status: 400 });
		}

		try {
			const artist = await prisma.artistTable.findFirst({
				where: { email: artistEmail }
			});

			if (!artist) {
				return fail(404, { message: 'Artist not found' });
			}

			await updateArtist(artist.id, formValidationResult.data);
			const updatedSubmission = await getSubmission(user);

			return returnWithUpdatedSubmission(formValidationResult, updatedSubmission);
		} catch (error) {
			return fail(500, { message: GENERIC_ERROR_MESSAGE });
		}
	}
};
```

### Example 2: Form Component with Proper ID

```svelte
<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { entrySchemaUI } from '$lib/zod-schemas';
	import { getRegisterState } from '$lib/context.svelte';

	let { entryId } = $props<{ entryId: number }>();
	let myState = getRegisterState();

	let form = superForm(myState.entryUpdateForm, {
		id: `entryUpdateForm-${entryId}`, // Dynamic ID for multiple instances
		validators: zod4Client(entrySchemaUI),
		onResult({ result }) {
			if (result.type === 'success') {
				myState.submission = result?.data?.updatedSubmission;
				toast.success('Entry updated successfully');
				myState.entryUpdateDialogOpen = false;
			} else {
				toast.error('Failed to update entry');
			}
		}
	});

	const { form: formData, enhance, errors, delayed } = form;
</script>

<form method="POST" action="?/entryUpdate" use:enhance>
	<!-- Form fields -->
</form>
```

### Example 3: Database Helper with JSDoc

```typescript
/**
 * Updates an entry record with partial data.
 *
 * @param entryId - Entry ID
 * @param data - Partial entry data to update
 * @returns Updated entry record
 *
 * @example
 * await updateEntry(456, { title: 'New Title', price: 50000 });
 */
export const updateEntry = async (entryId: number, data: Partial<Prisma.entryTableUpdateInput>) => {
	return await prisma.entryTable.update({
		where: { id: entryId },
		data
	});
};
```

### Example 4: Using Image Utilities

```typescript
import {
	getImagesWithPrimary,
	validatePrimaryImage,
	getDefaultPrimaryImage
} from '$lib/utils/primary-image';

// In RegisterState class
loadImagesFromEntry(entry: any) {
	if (entry.images && entry.images.length > 0) {
		this.workingImages = entry.images;

		if (entry.primaryImage?.imageId) {
			// Validate existing primary
			if (validatePrimaryImage(entry.primaryImage.imageId, entry.images)) {
				this.primaryImageId = entry.primaryImage.imageId;
			} else {
				this.primaryImageId = getDefaultPrimaryImage(entry.images);
			}
		} else {
			this.primaryImageId = getDefaultPrimaryImage(entry.images);
		}
	} else {
		this.clearWorkingImages();
	}
}

getImagesWithPrimary() {
	const imagesWithPrimary = getImagesWithPrimary(this.workingImages, this.primaryImageId);
	return {
		images: imagesWithPrimary,
		primaryImageId: this.primaryImageId
	};
}
```

### Example 5: Transaction for Multi-Step Operation

```typescript
import { prisma } from '$lib/components/server/prisma';

export const entryUpdate = async (event: RequestEvent) => {
	// ... validation ...

	try {
		await prisma.$transaction(async (tx) => {
			// Delete old images
			if (imagesToDelete.length > 0) {
				await tx.imageTable.deleteMany({
					where: { id: { in: imagesToDelete } }
				});
			}

			// Create new image
			if (newImageData) {
				const newImage = await tx.imageTable.create({
					data: newImageData
				});

				// Update primary image reference
				await tx.primaryImageTable.upsert({
					where: { entryId },
					update: { imageId: newImage.id },
					create: { entryId, imageId: newImage.id }
				});
			}

			// Update entry
			await tx.entryTable.update({
				where: { id: entryId },
				data: entryData
			});
		});

		return { success: true };
	} catch (error) {
		return fail(500, { message: GENERIC_ERROR_MESSAGE });
	}
};
```

---

## Summary

The refactoring effort established clear patterns for:

1. **Helper Functions**: Centralized utilities in `helpers.ts` and `registrationDB.ts`
2. **Constants**: All configurable values in `constants.ts`
3. **Form IDs**: Static (single quotes) vs Dynamic (template literals)
4. **Error Handling**: Consistent responses using SvelteKit's `fail()` and `message()`
5. **Image Management**: Utility functions in `primary-image.ts`
6. **Database Operations**: Transaction wrapping for multi-step operations
7. **Documentation**: JSDoc comments with examples

Following these patterns ensures consistency, maintainability, and reduces technical debt.
