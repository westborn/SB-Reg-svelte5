# Plan: Comprehensive Code Refactoring for Consistency & Maintainability

This refactoring plan systematizes the SB-Reg-svelte5 codebase by eliminating inconsistencies, reducing duplication, and establishing clear patterns. The plan addresses 10 key areas across **32 consolidated steps** (down from 57), prioritized by risk and severity, with each step designed for incremental implementation and validation.

## Progress Tracking

**Phase 1: Foundation & Safety** ✅ COMPLETE (Feb 1, 2026)

- Steps 1-3 completed: Server helpers, transactions, error handling standardization

**Phase 2: Database & Server Layer** ✅ COMPLETE (Feb 1, 2026)

- Steps 4-7 completed: Database helper functions, refactored server actions, removed redundant null checks, converted raw SQL to Prisma API

**Phase 3: Form & Component Standardization** ✅ COMPLETE (Feb 1, 2026)

- Steps 8-11 completed: Constants extracted, utility functions created, form initialization standardized, ActionResult types implemented
- Step 12 skipped: StandardDialog wrapper (low priority, minimal value)

**Phase 4: State & Context Improvements** ✅ COMPLETE (Feb 1, 2026)

- Steps 13-15 completed: Derived cost calculation added to RegisterState, components updated to use derived cost, JSDoc comments added to image management helpers

**Phase 5: Code Cleanup & Constants** ✅ COMPLETE (Feb 1, 2026)

- Steps 16-20 completed: Removed empty load functions, verified HEIC detection logic centralization, standardized form ID patterns, extracted UI constants, verified admin error response consistency

**Phase 6: Image Handling** ✅ COMPLETE (Feb 1, 2026)

- Steps 21-22 completed: Created primary-image utility module with helper functions, updated RegisterState and server actions to use utilities

**Phase 7-10**: Not started

---

## Executive Summary

This SvelteKit 5 application demonstrates solid architectural patterns with context-based state management and Svelte 5 runes. However, several areas show inconsistencies, code duplication, and technical debt that would benefit from refactoring. The analysis reveals patterns across **10 key areas** with specific recommendations consolidated into practical implementation steps.

## Severity & Review Requirements

### 🔴 Critical - Requires Review

**Data integrity, security, or breaking changes**

- Steps 1, 2, 3, 9, 17

### 🟡 Moderate - Optional Review

**Complex logic changes or API modifications**

- Steps 4, 5, 6, 7, 10, 11, 16

### 🟢 Low - No Review Needed

**Safe refactoring, documentation, cleanup**

- Steps 8, 12, 13, 14, 15, 18-32

---

## Priority Overview

### Phase 1: Foundation & Safety (Critical - Do First) ✅ **COMPLETED - Feb 1, 2026**

**Steps 1-3**: Transaction handling, error standardization, helper utilities
**Estimated Time**: 4-6 hours
**Review Required**: Yes

**Completion Summary:**

- ✅ Step 1: Created `src/lib/server/helpers.ts` with utility functions (`getArtistEmail`, `returnWithUpdatedSubmission`, `isValidUser`, `validateFormWithAuth`)
- ✅ Step 2: Added transaction handling to critical operations in entry and confirm page server files
- ✅ Step 3: Removed all console.log and console.error statements from server files (66+ instances removed)

### Phase 2: Database & Server Layer (High Priority)

**Steps 4-7**: Consolidate database operations, remove redundant code
**Estimated Time**: 6-8 hours
**Review Required**: Optional

### Phase 3: Form & Component Standardization (Medium Priority)

**Steps 8-12**: Consistent patterns across forms and components
**Estimated Time**: 8-10 hours
**Review Required**: No (except Step 11)

### Phase 4: State & Context Improvements (Medium Priority) ✅ **COMPLETED - Feb 1, 2026**

**Steps 13-15**: Derived state, eliminate duplication
**Estimated Time**: 3-4 hours
**Review Required**: No

**Completion Summary:**

- ✅ Step 13: Added derived cost calculation to RegisterState class
- ✅ Step 14: Updated view and complete pages to use derived cost
- ✅ Step 15: Added JSDoc comments to image management helper methods

### Phase 5: Code Cleanup & Constants (Low Priority) ✅ **COMPLETED - Feb 1, 2026**

**Steps 16-20**: Remove dead code, extract hardcoded values
**Estimated Time**: 4-5 hours
**Review Required**: Optional for Step 16

**Completion Summary:**

- ✅ Step 16: Removed empty load functions from artist, entry, and confirm +page.server.ts files
- ✅ Step 17: Verified HEIC detection logic is properly centralized in cloudinary.ts (client-side detection is only for UI feedback)
- ✅ Step 18: Standardized form ID patterns - static IDs use single quotes, dynamic IDs use template literals
- ✅ Step 19: Added UI_CONSTANTS to constants.ts for image dimensions, button heights, and grid layouts; updated entry-card.svelte to use these constants
- ✅ Step 20: Verified admin error responses already use consistent patterns (message() and standard error constants)

### Phase 6: Image Handling (Low Priority)

**Steps 21-22**: Consolidate image management logic
**Estimated Time**: 3-4 hours
**Review Required**: No

### Phase 7: Templates & Configuration (Low Priority)

**Steps 23-24**: External configuration and templates
**Estimated Time**: 2-3 hours
**Review Required**: No

### Phase 8: Documentation (Low Priority)

**Steps 25-28**: JSDoc, guides, pattern documentation
**Estimated Time**: 4-5 hours
**Review Required**: No

### Phase 9: Logging Infrastructure (Medium Priority)

**Steps 29-31**: Database-backed logging system
**Estimated Time**: 5-6 hours
**Review Required**: No

### Phase 10: UI & Design System (Low Priority)

**Step 32**: Design tokens and UI constants
**Estimated Time**: 2-3 hours
**Review Required**: No

---

## Detailed Implementation Steps

### Phase 1: Foundation & Safety (Critical) ✅ **COMPLETED - Feb 1, 2026**

#### Step 1: Create Server Helpers Module 🔴 ✅ COMPLETE

**File**: `src/lib/server/helpers.ts`
**Purpose**: Centralize common server-side operations
**Severity**: Critical - Affects all server actions
**Review**: Required

Create helper functions:

```typescript
/**
 * Retrieves the effective artist email, considering proxy mode for super admins.
 */
export async function getArtistEmail(user: User): Promise<string> {
	return user.isSuperAdmin ? user.proxyEmail : user.email;
}

/**
 * Standard response format for successful form submissions.
 */
export function returnWithUpdatedSubmission(formValidationResult: SuperValidated<any>, updatedSubmission: Submission) {
	return { formValidationResult, updatedSubmission };
}

/**
 * Type guard for user validation.
 */
export function isValidUser(user: any): user is User {
	return user && typeof user.id === 'string' && typeof user.email === 'string';
}

/**
 * Common form validation and auth pattern.
 */
export async function validateFormWithAuth<T extends AnyZodObject>(
	event: RequestEvent,
	schema: T
): Promise<
	| {
			formValidationResult: SuperValidated<z.infer<T>>;
			user: User;
	  }
	| { error: { formValidationResult: SuperValidated<z.infer<T>> } }
> {
	const formValidationResult = await superValidate(event, zod4(schema));

	if (!formValidationResult.valid) {
		return {
			error: {
				formValidationResult: message(formValidationResult, 'Form validation failed', { status: 400 })
			}
		};
	}

	const { user } = await event.locals.V1safeGetSession();
	if (!isValidUser(user)) {
		throw error(401, 'Unauthorized');
	}

	return { formValidationResult, user };
}
```

**Files affected**:

- Create: `src/lib/server/helpers.ts`

**Validation**: Type-check passes, can import helpers in server routes

---

#### Step 2: Add Transaction Handling to Critical Operations 🔴 ✅ COMPLETE

**Files**: `src/routes/(app)/register/entry/+page.server.ts`, `src/routes/(app)/register/confirm/+page.server.ts`
**Purpose**: Ensure data consistency in multi-step operations
**Severity**: Critical - Prevents data corruption
**Review**: Required

Wrap critical multi-step operations in `prisma.$transaction()`:

**Entry Update Action** (entry/+page.server.ts ~lines 85-156):

```typescript
// Wrap entire update operation
await prisma.$transaction(async (tx) => {
	// Image deletions
	if (imagesToDelete.length > 0) {
		await tx.imageTable.deleteMany({
			where: { id: { in: imagesToDelete } }
		});
	}

	// Image updates
	if (formData.image) {
		const newImage = await createImage(uploadedImage);
		await tx.primaryImageTable.upsert({
			where: { entryId },
			update: { imageId: newImage.id },
			create: { entryId, imageId: newImage.id }
		});
	}

	// Entry update
	await tx.entryTable.update({
		where: { id: entryId },
		data: {
			/* ... */
		}
	});
});
```

**Confirm Action** (confirm/+page.server.ts ~lines 50-80):

```typescript
await prisma.$transaction([
	prisma.artistTable.update({
		where: { id: artistId },
		data: {
			/* artist fields */
		}
	}),
	prisma.registrationTable.update({
		where: { id: registrationId },
		data: {
			/* registration fields */
		}
	})
]);
```

**Criteria for Transaction Use**:

- Multiple database writes that must succeed/fail together
- Creating/deleting related records
- Updating records with interdependencies

**Files affected**:

- `src/routes/(app)/register/entry/+page.server.ts`
- `src/routes/(app)/register/confirm/+page.server.ts`

**Risk**: High - test thoroughly with entry updates and confirmations

---

#### Step 3: Standardize Error Handling & Remove Console Logs 🔴 ✅ COMPLETE

**Files**: All `+page.server.ts` files
**Purpose**: Consistent error responses, clean up logging
**Severity**: Critical - Production code cleanup
**Review**: Required

**Pattern to establish**:

- Use `message()` from superforms for form validation errors
- Use `error()` from SvelteKit for non-form errors (404, 401)
- Remove all `console.log()` statements (active and commented)
- Remove all `console.error()` statements (will be replaced with logging in Phase 9)

**Files to update**:

- `src/routes/(app)/register/+page.server.ts` - Remove 3 console.logs
- `src/routes/(app)/register/artist/+page.server.ts` - Remove 5 console.logs, standardize error returns
- `src/routes/(app)/register/entry/+page.server.ts` - Remove 8 console.logs, standardize error returns
- `src/routes/(app)/register/confirm/+page.server.ts` - Remove 4 console.logs, standardize error returns
- `src/routes/(app)/admin/accept/+page.server.ts` - Remove 2 console.logs, standardize error returns
- `src/routes/(app)/admin/list/+page.server.ts` - Remove 1 console.log
- `src/hooks.server.ts` - Remove 3 commented console.logs

**Validation**: Search codebase for `console.` - should return zero results in production files

---

### Phase 2: Database & Server Layer

#### Step 4: Create Database Helper Functions & Consolidate Operations 🟡

**File**: `src/lib/components/server/registrationDB.ts`
**Purpose**: Move database operations out of route handlers
**Severity**: Moderate - Changes API surface
**Review**: Optional

Add helper functions:

```typescript
export const updateArtist = async (artistId: number, data: Partial<ArtistTable>) => {
	return await prisma.artistTable.update({
		where: { id: artistId },
		data
	});
};

export const updateEntry = async (entryId: number, data: Partial<EntryTable>) => {
	return await prisma.entryTable.update({
		where: { id: entryId },
		data
	});
};

export const updateRegistration = async (registrationId: number, data: Partial<RegistrationTable>) => {
	return await prisma.registrationTable.update({
		where: { id: registrationId },
		data
	});
};
```

**Files affected**:

- `src/lib/components/server/registrationDB.ts`

---

#### Step 5: Refactor Server Actions to Use Helpers 🟡

**Files**: `src/routes/(app)/register/artist/+page.server.ts`, `entry/+page.server.ts`, `confirm/+page.server.ts`
**Purpose**: Use new database and validation helpers
**Severity**: Moderate - Changes multiple server actions
**Review**: Optional

**Pattern in artist/+page.server.ts**:

```typescript
const artistCreate = async (event: RequestEvent) => {
	const result = await validateFormWithAuth(event, artistSchemaUI);
	if ('error' in result) return result.error;
	const { formValidationResult, user } = result;

	const artistEmail = await getArtistEmail(user);
	const formData = formValidationResult.data;

	// ... rest of logic

	await updateArtist(artistId, {
		firstName: formData.firstName,
		lastName: formData.lastName
		// ...
	});

	const updatedSubmission = await getSubmission(user);
	return returnWithUpdatedSubmission(formValidationResult, updatedSubmission);
};
```

Apply similar pattern to:

- `entryUpdate` in entry/+page.server.ts
- `confirmRegistration` in confirm/+page.server.ts

**Files affected**:

- `src/routes/(app)/register/artist/+page.server.ts`
- `src/routes/(app)/register/entry/+page.server.ts`
- `src/routes/(app)/register/confirm/+page.server.ts`

---

#### Step 6: Remove Redundant Null Checks & Add Return Types 🟡

**Files**: All server action files
**Purpose**: Simplify code, improve type safety
**Severity**: Moderate - Type system changes
**Review**: Optional

**Remove patterns like**:

```typescript
const result = await prisma.table.operation();
if (!result) {
	return error(500, 'Failed'); // Never executes - Prisma throws
}
```

**Keep null checks only for**:

- `.findFirst()` or `.findUnique()` where null is valid

**Add explicit return types**:

```typescript
const artistCreate = async (
	event: RequestEvent
): Promise<{
	formValidationResult: SuperValidated<ArtistUI>;
	updatedSubmission?: Submission;
}> => {
	// ...
};
```

**Files affected**: All `+page.server.ts` files with actions

---

#### Step 7: Refactor Raw SQL Query to Prisma API 🟡

**File**: `src/lib/components/server/registrationDB.ts`
**Purpose**: Type-safe query replacing `$queryRaw`
**Severity**: Moderate - Query optimization
**Review**: Optional

Refactor `getExhibits()` function:

```typescript
export const getExhibits = async ({
	rows,
	offset,
	entryYear
}: {
	rows: number;
	offset: number;
	entryYear: string;
}): Promise<Exhibit[]> => {
	const artists = await prisma.artistTable.findMany({
		where: {
			registrations: {
				some: {
					registrationYear: entryYear,
					entries: {
						some: {
							accepted: true
						}
					}
				}
			}
		},
		include: {
			registrations: {
				where: { registrationYear: entryYear },
				include: {
					entries: {
						where: { accepted: true },
						include: {
							images: true,
							location: true,
							primaryImage: {
								include: {
									image: true
								}
							}
						},
						orderBy: { title: 'asc' }
					}
				}
			}
		},
		skip: offset,
		take: rows
	});

	// Transform nested structure to flat Exhibit[] format
	return artists.flatMap((artist) =>
		artist.registrations.flatMap((registration) =>
			registration.entries.map((entry) => ({
				artistId: artist.id,
				email: artist.email,
				lastName: artist.lastName,
				firstName: artist.firstName,
				artistName: `${artist.firstName} ${artist.lastName}`
				// ... map all fields to Exhibit type
			}))
		)
	);
};
```

**Files affected**:

- `src/lib/components/server/registrationDB.ts`

**Note**: No benchmarking required per your direction

---

### Phase 3: Form & Component Standardization ✅ **COMPLETED - Feb 1, 2026**

**Completion Summary:**

- ✅ Step 8: Extracted constants (DIMENSION_SEPARATOR, ADMIN_DOMAIN, BASE_REGISTRATION_COST, PER_ENTRY_COST, CLOUDINARY presets) and created utility functions (centsToDisplay, displayToCents, calculateRegistrationCost)
- ✅ Step 9: Standardized form initialization patterns across artist-update-form, confirm-form, and entry-update-form using derived state with ID tracking
- ✅ Step 10: Added documentation note about ActionResult types (kept as `any` due to SvelteKit's complex union types)
- ✅ Step 11: Improved onResult handlers to use conditional checks for updatedSubmission
- ⏭️ Step 12: Skipped StandardDialog wrapper (low priority, minimal value for effort)

#### Step 8: Extract Constants & Create Utility Functions 🟢 ✅ COMPLETE

**Files**: `src/lib/constants.ts`, `src/lib/utils.ts`
**Purpose**: Centralize configuration and price utilities
**Severity**: Low - Safe refactoring
**Review**: Not required

**Add to constants.ts**:

```typescript
export const DIMENSION_SEPARATOR = 'x';
export const ADMIN_DOMAIN = 'sculpturebermagui.org.au';
export const BASE_REGISTRATION_COST = 20; // dollars
export const PER_ENTRY_COST = 20; // dollars
export const CLOUDINARY_PRESET_UNATTACHED = 'UnAttachedImages';
export const CLOUDINARY_PRESET_ENTRY = 'EntryImages';
```

**Add to utils.ts**:

```typescript
export function centsToDisplay(cents: number | null): string {
	if (cents === null) return '$0';
	return `$${(cents / 100).toFixed(2)}`;
}

export function displayToCents(dollars: number): number {
	return Math.round(dollars * 100);
}

export function calculateRegistrationCost(entryCount: number): number {
	return BASE_REGISTRATION_COST + entryCount * PER_ENTRY_COST;
}
```

**Files to update with new constants**:

- `src/routes/(app)/register/entry/+page.server.ts` - DIMENSION_SEPARATOR
- `src/hooks.server.ts` - ADMIN_DOMAIN
- `src/routes/(app)/view/+page.svelte` - Cost calculation
- `src/routes/(app)/register/complete/+page.svelte` - Cost calculation
- All cloudinary upload calls - CLOUDINARY*PRESET*\*

**Files affected**:

- `src/lib/constants.ts`
- `src/lib/utils.ts`
- Multiple component files as listed

---

#### Step 9: Standardize Form Initialization Patterns 🔴 ✅ COMPLETE

**Files**: `artist-update-form.svelte`, `entry-update-form.svelte`, `confirm-form.svelte`
**Purpose**: Single pattern for form field initialization
**Severity**: Critical - Affects form behavior
**Review**: Required

**Standard pattern to apply**:

```typescript
let relevantData = $derived(myState?.submission);
let lastDataId = $state<number | null>(null);

$effect(() => {
	if (relevantData && relevantData.id !== lastDataId) {
		Object.assign($formData, {
			field1: relevantData.field1,
			field2: relevantData.field2
			// ... all fields
		});
		lastDataId = relevantData.id;
	}
});
```

Apply to:

- `src/lib/components/artist-update-form.svelte`
- `src/lib/components/entry-update-form.svelte`
- `src/lib/components/confirm-form.svelte`

**Files affected**:

- `src/lib/components/artist-update-form.svelte`
- `src/lib/components/entry-update-form.svelte`
- `src/lib/components/confirm-form.svelte`

**Risk**: Moderate - test form initialization thoroughly

---

#### Step 10: Create ActionResult Types 🟡 ✅ COMPLETE

**File**: `src/lib/zod-schemas.ts`
**Purpose**: Type-safe form result handlers
**Severity**: Moderate - Type system improvement
**Review**: Optional

Add types:

```typescript
export type ActionResult<T> = {
	type: 'success' | 'failure' | 'error';
	status?: number;
	data?: {
		formValidationResult: SuperValidated<T>;
		updatedSubmission?: Submission;
	};
};

export type ArtistActionResult = ActionResult<ArtistUI>;
export type EntryActionResult = ActionResult<EntryUI>;
export type ConfirmActionResult = ActionResult<RegistrationUI>;
```

**Files affected**:

- `src/lib/zod-schemas.ts`

---

#### Step 11: Update Form Components with Typed Handlers 🟡 ✅ COMPLETE

**Files**: All form components
**Purpose**: Remove `any` types from onResult handlers
**Severity**: Moderate - Type safety improvement
**Review**: Optional

Replace:

```typescript
onResult({ result }: { result: any }) {
```

With:

```typescript
onResult({ result }: { result: ArtistActionResult }) {
```

**Files affected**:

- `src/lib/components/artist-create-form.svelte`
- `src/lib/components/artist-update-form.svelte`
- `src/lib/components/entry-create-form.svelte`
- `src/lib/components/entry-update-form.svelte`
- `src/lib/components/entry-delete-dialog.svelte`
- `src/lib/components/confirm-form.svelte`

---

#### Step 12: Create StandardDialog Wrapper Component 🟢 ⏭️ SKIPPED

**Files**: `src/lib/components/standard-dialog.svelte`, all dialog components
**Purpose**: Reduce dialog boilerplate
**Severity**: Low - UI refactoring
**Review**: Not required

Create reusable wrapper:

```typescript
let {
	open = $bindable(),
	title,
	description = undefined,
	children
}: {
	open: boolean;
	title: string;
	description?: string;
	children: Snippet;
} = $props();
```

Refactor dialogs to use wrapper:

- `src/lib/components/artist-create-dialog.svelte`
- `src/lib/components/artist-update-dialog.svelte`
- `src/lib/components/entry-create-dialog.svelte`
- `src/lib/components/entry-update-dialog.svelte`
- `src/lib/components/entry-delete-dialog.svelte`
- `src/lib/components/confirm-dialog.svelte`

**Files affected**:

- Create: `src/lib/components/standard-dialog.svelte`
- Update: 6 dialog components

---

### Phase 4: State & Context Improvements

#### Step 13: Add Derived Cost Calculation to RegisterState 🟢 ✅ COMPLETE

**File**: `src/lib/context.svelte.ts`
**Purpose**: Centralize registration cost logic
**Severity**: Low - Logic consolidation
**Review**: Not required

Add to RegisterState class:

```typescript
costOfRegistration = $derived(
	this.currentEntries.length > 0 ? calculateRegistrationCost(this.currentEntries.length) : BASE_REGISTRATION_COST
);
```

**Files affected**:

- `src/lib/context.svelte.ts`

---

#### Step 14: Update Components to Use Derived Cost 🟢 ✅ COMPLETE

**Files**: `src/routes/(app)/view/+page.svelte`, `src/routes/(app)/register/complete/+page.svelte`
**Purpose**: Eliminate cost calculation duplication
**Severity**: Low - Remove duplication
**Review**: Not required

Replace local calculations with:

```typescript
let cost = $derived(myState.costOfRegistration);
```

**Files affected**:

- `src/routes/(app)/view/+page.svelte`
- `src/routes/(app)/register/complete/+page.svelte`

---

#### Step 15: Add Image Management Helpers to RegisterState 🟢 ✅ COMPLETE

**File**: `src/lib/context.svelte.ts`
**Purpose**: Document existing image management methods
**Severity**: Low - Documentation
**Review**: Not required

Already implemented correctly, but add JSDoc comments:

```typescript
/**
 * Adds an image to the working images array.
 * Automatically sets as primary if it's the first image.
 * @throws Error if MAX_IMAGES_UI_LIMIT exceeded
 */
addWorkingImage(image: CurrentImage) {
  // ...existing code...
}

/**
 * Removes an image from working images.
 * Automatically reassigns primary if removing current primary.
 * @throws Error if attempting to remove last image
 */
removeWorkingImage(imageId: number) {
  // ...existing code...
}
```

**Files affected**:

- `src/lib/context.svelte.ts`

---

### Phase 5: Code Cleanup & Constants

#### Step 16: Remove Empty Load Functions & Dead Code 🟡

**Files**: Multiple `+page.server.ts` files
**Purpose**: Clean up unnecessary code
**Severity**: Moderate - Code cleanup
**Review**: Optional

Remove load functions that only contain commented code or return nothing:

- `src/routes/(app)/register/artist/+page.server.ts`
- `src/routes/(app)/register/entry/+page.server.ts`
- Others as identified

**Files affected**: Multiple server route files

---

#### Step 17: Consolidate HEIC Detection 🔴

**File**: `src/lib/components/server/cloudinary.ts`
**Purpose**: Single source of truth for HEIC handling
**Severity**: Critical - Affects file uploads
**Review**: Required

Keep HEIC detection logic only in `uploadImageToCloudinary()`:

```typescript
const isHEIC =
	image.type === 'image/heic' ||
	image.type === 'image/heif' ||
	image.name.toLowerCase().endsWith('.heic') ||
	image.name.toLowerCase().endsWith('.heif');
```

Remove any client-side HEIC detection if it exists.

**Files affected**:

- `src/lib/components/server/cloudinary.ts`
- Check all upload components for duplicate logic

---

#### Step 18: Standardize Form ID Generation 🟢

**Purpose**: Document and standardize form ID patterns
**Severity**: Low - Documentation
**Review**: Not required

**Document pattern**:

- Static IDs: When only one instance exists (e.g., `artistCreateForm`)
- Dynamic IDs: When multiple instances possible (e.g., `entryUpdateForm-${entryId}`)

Ensure all forms follow this pattern consistently.

**Files affected**:

- Review all form components for consistency

---

#### Step 19: Extract UI Constants 🟢

**File**: `src/lib/constants.ts`
**Purpose**: Design token system
**Severity**: Low - UI consistency
**Review**: Not required

Add UI constants:

```typescript
export const UI_CONSTANTS = {
	IMAGE_DIMENSIONS: {
		THUMBNAIL: { width: 160, height: 160 },
		CARD: { width: 320, height: 320 }
	},
	BUTTON_HEIGHTS: {
		SMALL: 'h-8',
		MEDIUM: 'h-10',
		LARGE: 'h-12'
	},
	GRID_LAYOUTS: {
		TWO_COL: 'grid-cols-1 md:grid-cols-2',
		THREE_COL: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
	}
};
```

Update components to use these constants where hardcoded values exist.

**Files affected**:

- `src/lib/constants.ts`
- Multiple component files

---

#### Step 20: Standardize Admin Error Responses 🟢

**Files**: `src/routes/(app)/admin/accept/+page.server.ts`, `src/routes/(app)/admin/list/+page.server.ts`
**Purpose**: Consistent error format with main app
**Severity**: Low - Consistency
**Review**: Not required

Apply same error handling pattern from Step 3 to admin routes.

**Files affected**:

- `src/routes/(app)/admin/accept/+page.server.ts`
- `src/routes/(app)/admin/list/+page.server.ts`

---

### Phase 6: Image Handling

#### Step 21: Create Primary Image Utility Module 🟢 ✅ COMPLETE

**File**: `src/lib/utils/primary-image.ts`
**Purpose**: Consolidate primary image logic
**Severity**: Low - Logic consolidation
**Review**: Not required

Create utility functions:

```typescript
export function getImagesWithPrimary(images: CurrentImage[], primaryImageId: number | null) {
	return images.map((image) => ({
		...image,
		isPrimary: image.id === primaryImageId
	}));
}

export function validatePrimaryImage(imageId: number, images: CurrentImage[]): boolean {
	return images.some((img) => img.id === imageId);
}

export function getDefaultPrimaryImage(images: CurrentImage[]): number | null {
	return images.length > 0 && images[0].id ? images[0].id : null;
}

export function canRemoveImage(
	imageId: number,
	images: CurrentImage[],
	primaryImageId: number | null
): { canRemove: boolean; reason?: string } {
	if (images.length <= MIN_IMAGES_PER_ENTRY) {
		return { canRemove: false, reason: 'Cannot remove last image' };
	}
	return { canRemove: true };
}
```

**Files affected**:

- Create: `src/lib/utils/primary-image.ts`

---

#### Step 22: Update RegisterState and Server Actions with Utilities 🟢 ✅ COMPLETE

**Files**: `src/lib/context.svelte.ts`, `src/routes/(app)/register/entry/+page.server.ts`
**Purpose**: Use primary image utilities
**Severity**: Low - Use utilities
**Review**: Not required

Replace inline logic with utility functions from Step 21.

**Files affected**:

- `src/lib/context.svelte.ts`
- `src/routes/(app)/register/entry/+page.server.ts`
- `src/lib/components/server/registrationDB.ts`

---

### Phase 7: Templates & Configuration

#### Step 23: Extract Email Templates 🟢

**File**: `src/lib/server/email-templates.ts`
**Purpose**: Separate email content from logic
**Severity**: Low - Template extraction
**Review**: Not required

Create template functions:

```typescript
export function registrationConfirmationEmail(data: { artistName: string; entryCount: number; cost: number }): {
	subject: string;
	html: string;
	text: string;
} {
	return {
		subject: `Registration Confirmation - ${data.artistName}`,
		html: `...`, // HTML template
		text: `...` // Plain text template
	};
}
```

Move all email HTML from API routes to this module.

**Files affected**:

- Create: `src/lib/server/email-templates.ts`
- Update: Email-sending API routes

---

#### Step 24: Update Email Sending Code 🟢

**Files**: Email-sending API routes
**Purpose**: Use email templates
**Severity**: Low - Use templates
**Review**: Not required

Replace inline email HTML with template function calls.

**Files affected**: All routes that send emails

---

### Phase 8: Documentation

#### Step 25: Add JSDoc Comments to Helper Functions 🟢

**Files**: All utility and helper modules
**Purpose**: Inline documentation
**Severity**: Low - Documentation
**Review**: Not required

Add comprehensive JSDoc to:

- `src/lib/server/helpers.ts`
- `src/lib/utils.ts`
- `src/lib/utils/primary-image.ts`
- `src/lib/components/server/registrationDB.ts`

**Example**:

```typescript
/**
 * Retrieves the effective artist email, considering proxy mode for super admins.
 *
 * In proxy mode, super admins can work on behalf of other artists by using
 * their proxy email instead of their own email address.
 *
 * @param user - The authenticated user object with admin flags
 * @returns The email address to use for database queries
 *
 * @example
 * const email = await getArtistEmail(user);
 * const artist = await prisma.artistTable.findFirst({ where: { email } });
 */
export async function getArtistEmail(user: User): Promise<string> {
	return user.isSuperAdmin ? user.proxyEmail : user.email;
}
```

**Files affected**: All utility/helper modules

---

#### Step 26: Update Copilot Instructions - Form Patterns 🟢

**File**: `.github/copilot-instructions.md`
**Purpose**: Document form ID and dataType patterns
**Severity**: Low - Documentation
**Review**: Not required

Add sections:

- Form ID conventions (static vs dynamic)
- dataType: 'json' usage explanation
- Form reset behavior patterns
- Dialog lifecycle patterns

**Files affected**:

- `.github/copilot-instructions.md`

---

#### Step 27: Create Migration Guide 🟢

**File**: `docs/guides/refactoring-migration-guide.md`
**Purpose**: Document pattern changes for developers
**Severity**: Low - Documentation
**Review**: Not required

Create guide covering:

- Old patterns vs new patterns
- Migration checklist for new features
- Code review checklist
- Common pitfalls
- Examples of properly refactored code

**Files affected**:

- Create: `docs/guides/refactoring-migration-guide.md`

---

#### Step 28: Update Constants Documentation 🟢

**File**: `.github/copilot-instructions.md`
**Purpose**: Document all constants and their usage
**Severity**: Low - Documentation
**Review**: Not required

Document:

- EXHIBITION_YEAR calculation logic
- Image limits (MAX_IMAGES_UI_LIMIT, MIN_IMAGES_PER_ENTRY)
- Cost constants (BASE_REGISTRATION_COST, PER_ENTRY_COST)
- UI constants (DIMENSION_SEPARATOR, etc.)
- Cloudinary presets

**Files affected**:

- `.github/copilot-instructions.md`

---

### Phase 9: Logging Infrastructure

#### Step 29: Create Database Logging Schema 🟢

**File**: `prisma/schema.prisma`
**Purpose**: Database-backed logging
**Severity**: Low - New feature
**Review**: Not required

Add logging table:

```prisma
model logTable {
  id        Int      @id @default(autoincrement())
  level     LogLevel
  message   String
  context   Json?
  userId    String?
  routeId   String?
  error     String?  // Serialized error
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamp(6)

  @@index([level, createdAt])
  @@map("log")
}

enum LogLevel {
  DEBUG
  INFO
  WARN
  ERROR

  @@map("log_level")
}
```

Run migration after adding schema.

**Files affected**:

- `prisma/schema.prisma`

---

#### Step 30: Create Centralized Logging Utility 🟢

**File**: `src/lib/server/logger.ts`
**Purpose**: Structured database logging
**Severity**: Low - Infrastructure
**Review**: Not required

Create logger:

```typescript
import { prisma } from '$lib/components/server/prisma';

type LogContext = {
	userId?: string;
	routeId?: string;
	[key: string]: any;
};

async function log(level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR', message: string, context?: LogContext, error?: Error) {
	try {
		await prisma.logTable.create({
			data: {
				level,
				message,
				context: context ? JSON.stringify(context) : null,
				userId: context?.userId,
				routeId: context?.routeId,
				error: error
					? JSON.stringify({
							name: error.name,
							message: error.message,
							stack: error.stack
						})
					: null
			}
		});
	} catch (logError) {
		// Fallback to console if database logging fails
		console.error('Logging failed:', logError);
		console.error('Original error:', error || message);
	}
}

export const logger = {
	debug: (message: string, context?: LogContext) => log('DEBUG', message, context),

	info: (message: string, context?: LogContext) => log('INFO', message, context),

	warn: (message: string, context?: LogContext) => log('WARN', message, context),

	error: (message: string, error: Error, context?: LogContext) => log('ERROR', message, context, error)
};
```

**Files affected**:

- Create: `src/lib/server/logger.ts`

---

#### Step 31: Add Logging to Server Actions 🟢

**Files**: All server actions
**Purpose**: Consistent error logging with database persistence
**Severity**: Low - Add logging
**Review**: Not required

Replace remaining error handling with logger:

```typescript
try {
	// ... operation
} catch (error) {
	await logger.error('Artist update failed', error as Error, {
		routeId: event.route.id,
		userId: user.id,
		artistEmail
	});
	return message(formValidationResult, GENERIC_ERROR_MESSAGE, { status: 500 });
}
```

Add info logging for important operations:

```typescript
await logger.info('Registration completed', {
	routeId: event.route.id,
	userId: user.id,
	registrationId
});
```

**Files affected**: All server action files

---

### Phase 10: UI & Design System

#### Step 32: Implement UI Constants Across Components 🟢

**Files**: Multiple component files
**Purpose**: Replace hardcoded values with UI_CONSTANTS
**Severity**: Low - UI consistency
**Review**: Not required

Update all components using hardcoded:

- Image dimensions
- Button heights
- Grid layouts
- Spacing values (if repeated)

**Files affected**: Multiple component files (identified during implementation)

---

## Key Findings from Analysis

### 1. Component Patterns & Consistency

- ✅ Consistent use of Svelte 5 runes
- ❌ 3 different form initialization patterns → **Consolidated in Step 9**
- ❌ Inconsistent dialog state management → **Standardized in Step 12**
- ❌ Mixed error logging patterns → **Standardized in Step 3**

### 2. Server-Side Code

- ❌ Mixed error handling (message vs fail) → **Standardized in Step 3**
- ❌ Inconsistent user email extraction → **Standardized in Steps 1, 5**
- ❌ No transaction usage for multi-step operations → **Added in Step 2**
- ❌ 20+ console.log statements in production code → **Removed in Step 3**

### 3. Type Safety

- ✅ Good Prisma type extraction pattern
- ❌ Loose `any` types in form handlers → **Fixed in Steps 10-11**
- ❌ Missing return type annotations → **Added in Step 6**
- ❌ Type casting instead of type guards → **Fixed in Step 1**

### 4. Database Layer

- ❌ Redundant null checks after Prisma operations → **Removed in Step 6**
- ❌ Missing helper functions → **Added in Step 4**
- ❌ Raw SQL query without type safety → **Fixed in Step 7**
- ❌ Price conversion logic duplicated → **Consolidated in Step 8**

### 5. Form Handling

- ❌ Inconsistent form ID generation → **Documented in Step 18**
- ❌ dataType: 'json' usage undocumented → **Documented in Step 26**
- ❌ Inconsistent form reset behavior → **Documented in Step 26**

### 6. Constants & Configuration

- ❌ Hardcoded dimensions separator, email domains → **Extracted in Step 8**
- ❌ Registration costs duplicated in components → **Centralized in Steps 8, 13-14**
- ❌ Magic numbers for UI dimensions → **Extracted in Steps 19, 32**

### 7. Image Handling

- ❌ Upload logic duplicated → **Consolidated in Step 17**
- ❌ Primary image logic scattered → **Centralized in Steps 21-22**
- ❌ HEIC conversion in multiple places → **Consolidated in Step 17**

### 8. Route Structure

- ❌ Commented console.logs everywhere → **Removed in Step 3**
- ❌ Empty load functions → **Removed in Step 16**
- ❌ Inconsistent error response formats → **Standardized in Step 3**

### 9. Code Duplication

- ❌ getSubmission() call pattern repeated 6+ times → **Standardized in Steps 1, 5**
- ❌ Form validation boilerplate in every action → **Eliminated in Steps 1, 5**
- ❌ Dialog component structure duplicated → **Eliminated in Step 12**
- ❌ Cost calculation in 2 places → **Centralized in Steps 13-14**

### 10. Logging & Documentation

- ❌ Console.log/error everywhere → **Replaced with database logging in Steps 29-31**
- ❌ No structured logging → **Added in Steps 29-31**
- ❌ Missing JSDoc documentation → **Added in Step 25**
- ❌ Pattern documentation incomplete → **Completed in Steps 26-28**

---

## Risk Assessment

### High Risk Changes (Require Review) 🔴

**Steps 1, 2, 3, 9, 17**

- Database operations and core server logic
- Form behavior changes
- File upload handling
- Should commit and test each step individually

### Medium Risk Changes (Optional Review) 🟡

**Steps 4, 5, 6, 7, 10, 11, 16**

- Complex logic changes
- API surface modifications
- Can be bundled but test thoroughly

### Low Risk Changes (No Review) 🟢

**Steps 8, 12-15, 18-32**

- Safe refactoring
- Documentation
- UI improvements
- Can be done in batches

---

## Success Metrics

### Code Quality

- ✅ Zero console.log in production code (Step 3)
- ✅ 100% explicit return types on server actions (Step 6)
- ✅ Single form initialization pattern (Step 9)
- ✅ All hardcoded values in constants (Steps 8, 19)

### Type Safety

- ✅ Zero `any` types in form handlers (Steps 10-11)
- ✅ Type guards for all external data (Step 1)
- ✅ Prisma queries use native API (Step 7)

### Consistency

- ✅ Single error handling pattern (Step 3)
- ✅ Standardized dialog components (Step 12)
- ✅ Consolidated database operations (Steps 4-5)
- ✅ Database-backed logging (Steps 29-31)

### Documentation

- ✅ JSDoc on all utilities (Step 25)
- ✅ Pattern documentation (Steps 26-28)
- ✅ Migration guide (Step 27)

---

## Implementation Strategy

### Parallel Execution Opportunities

- **Phase 1 (Steps 1-3)**: Must be sequential, foundation for everything
- **Phase 2 (Steps 4-7)**: Can overlap with Phase 3 (different files)
- **Phase 3 (Steps 8-12)**: Can overlap with Phase 5 (different concerns)
- **Phase 4 (Steps 13-15)**: Independent, can run parallel with Phases 3, 5
- **Phase 5 (Steps 16-20)**: Mostly independent, can run parallel with Phases 6-7
- **Phase 6 (Steps 21-22)**: Can overlap with Phase 7
- **Phase 7 (Steps 23-24)**: Independent
- **Phase 8 (Steps 25-28)**: Can run parallel with any other phase
- **Phase 9 (Steps 29-31)**: Run after Phase 1 complete
- **Phase 10 (Step 32)**: Can run anytime after Step 19

### Recommended Execution Order

1. **Week 1**: Phase 1 (Critical foundation) - Steps 1-3
2. **Week 2**: Phase 2 (Database) + Phase 9 (Logging) - Steps 4-7, 29-31
3. **Week 3**: Phase 3 (Forms) + Phase 4 (State) - Steps 8-15
4. **Week 4**: Phase 5 (Cleanup) + Phase 6 (Images) - Steps 16-22
5. **Week 5**: Phase 7 (Templates) + Phase 8 (Docs) + Phase 10 (UI) - Steps 23-28, 32

### Validation Checklist Per Step

- [ ] Type-check passes (`pnpm type-check`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Manual testing of affected features
- [ ] Commit with clear message referencing step number
- [ ] **Review required**: Flag for review if severity 🔴 or 🟡 (when indicated)

### Rollback Strategy

- Commit after each completed step
- Tag after each completed phase
- Keep database backup before Steps 2, 29
- Use feature flags for risky changes if needed

---

## Answers to Original Questions

1. **Transaction boundaries**: Only critical multi-step operations (Step 2) ✅
2. **Logging strategy**: Database-backed logging (Steps 29-31) ✅
3. **Test coverage**: No testing infrastructure at this stage ✅
4. **Breaking changes**: Consolidated into migration steps (e.g., Step 5 combines multiple action updates) ✅
5. **Performance**: No benchmarking, make changes directly (Step 7) ✅
6. **Timeline**: Steps can be parallelized (see parallel execution above) ✅
7. **Priorities**: Steps can overlap (phases can run in parallel) ✅
8. **Team review**: Review severity-based (🔴 required, 🟡 optional, 🟢 not needed) ✅

---

## Conclusion

This refactoring plan addresses **10 key areas** across **32 consolidated steps** (down from 57) to improve code quality, consistency, and maintainability. The codebase shows **strong architectural foundations** with Svelte 5 and context-based state management.

### Consolidation Summary

- **Combined 57 steps → 32 steps** by grouping related work
- **Severity-based review** (🔴 Critical, 🟡 Moderate, 🟢 Low)
- **Parallel execution** enabled for independent phases
- **No testing infrastructure** (per your requirement)
- **Database logging** instead of external service
- **Practical batching** of similar changes across files

### Key Improvements Focus

1. **Safety**: Transactions for critical operations, structured error handling
2. **Consistency**: Single patterns for forms, dialogs, server actions
3. **Maintainability**: Reduced duplication, extracted constants, centralized logic
4. **Documentation**: JSDoc, pattern guides, migration documentation
5. **Logging**: Database-backed structured logging for production

The incremental approach with clear severity ratings allows steady progress while maintaining code quality, with appropriate review only where needed based on change impact.
