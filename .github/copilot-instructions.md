# Copilot Instructions for Sculpture Bermagui Registration System

## Project Context

This is a **SvelteKit 5** application (modern Svelte with runes) managing artist registrations and artwork submissions for an annual sculpture exhibition. It handles the complete lifecycle from artist registration through exhibition logistics and administration.

**Tech Stack**: SvelteKit 5 + TypeScript + PostgreSQL/Prisma + Supabase Auth + Tailwind/bits-ui + Cloudinary + Nodemailer

## Critical Architectural Patterns

### Database Schema & Relationships

The schema uses a multi-table structure with cascade deletion:

- `artistTable` → `registrationTable` (yearly registrations) → `entryTable` (artworks)
- `imageTable` linked to artist/registration/entry
- `primaryImageTable` tracks one primary image per entry
- `locationTable` for exhibition placement (one-to-one with entry)

**Key Pattern**: All foreign keys use cascade delete. Always include proper Prisma relations in queries.

### Svelte 5 Runes (NOT Legacy Svelte 4)

**Critical**: This project uses Svelte 5 runes exclusively. Never use legacy patterns:

```typescript
// ✅ CORRECT - Svelte 5 patterns
let count = $state(0);
let doubled = $derived(count * 2);
$effect(() => {
	console.log(count);
});

// ❌ WRONG - Legacy Svelte 4 (never use these)
let count = 0; // with $$invalidate
$: doubled = count * 2;
$: {
	console.log(count);
}
export let prop; // use props() instead
```

Import from `$app/state` not `$app/stores`:

```typescript
import { page } from '$app/state'; // ✅ Svelte 5
// NOT: import { page } from '$app/stores'; // ❌ Svelte 4
```

### Context-Based State Management

The app uses a class-based context system in [`context.svelte.ts`](../src/lib/context.svelte.ts):

```typescript
// Define state class with $state properties
class RegisterState {
	submission = $state() as Submission;
	workingEntry = $state() as CurrentEntry;
	artistExists = $derived(this.submission ? true : false);
	// ...
}

// Set context in layout
setContext('registerState', new RegisterState(init));

// Get context in components
let myState = getRegisterState();
```

All form dialogs (`artistCreateDialogOpen`, `entryUpdateDialogOpen`, etc.) are controlled via this shared state.

### Form Handling with sveltekit-superforms

**Standard Pattern** (see [`artist-create-form.svelte`](../src/lib/components/artist-create-form.svelte)):

```typescript
import { superForm } from 'sveltekit-superforms';
import { zod4Client } from 'sveltekit-superforms/adapters';

let form = superForm(myState.artistForm, {
	id: 'uniqueFormId',
	validators: zod4Client(schemaName),
	onResult({ result }) {
		if (result.type === 'success') {
			myState.submission = result?.data?.updatedSubmission;
			toast.success('Success message');
			myState.dialogOpen = false;
		} else {
			toast.error('Error message');
		}
	}
});

const { form: formData, enhance, errors, delayed } = form;
```

Forms use `method="POST" action="?/actionName" use:enhance`.

#### Form ID Conventions

**Static Form IDs** use single quotes:

```typescript
let form = superForm(myState.artistForm, {
	id: 'artistCreateForm', // Single quotes for static IDs
	validators: zod4Client(artistSchemaUI)
});
```

**Dynamic Form IDs** use template literals:

```typescript
let form = superForm(myState.entryUpdateForm, {
	id: `entryUpdateForm-${entryId}`, // Template literal for dynamic IDs
	validators: zod4Client(entrySchemaUI)
});
```

This distinction is critical when multiple instances of the same form component exist on the same page (e.g., update forms in accordion lists).

#### Form Reset & Dialog Lifecycle

Forms automatically reset on successful submission via the `onResult` handler:

```typescript
onResult({ result }) {
	if (result.type === 'success') {
		myState.submission = result?.data?.updatedSubmission;
		toast.success('Success message');
		myState.dialogOpen = false; // Closing dialog triggers form reset
	}
}
```

The form state is managed through the context system, and closing the dialog automatically resets the form for the next use.

#### dataType: 'json' Usage

Not currently used in this application. All form data is sent as standard `application/x-www-form-urlencoded`. Reserve `dataType: 'json'` for future complex nested object submissions if needed.

### Server Actions & Error Handling

**Standard Pattern** in `+page.server.ts` files:

```typescript
import { fail } from '@sveltejs/kit';
import { GENERIC_ERROR_MESSAGE } from '$lib/constants';

export const actions = {
	actionName: async (event) => {
		try {
			const result = await prisma.table.operation({
				/* ... */
			});
			return { success: true, data: result };
		} catch (error) {
			console.error(`${event.route.id} - `, error);
			return fail(500, { message: GENERIC_ERROR_MESSAGE });
		}
	}
};
```

Always log errors with `event.route.id` prefix for debugging.

## Key Business Logic

### Exhibition Year Calculation

The `EXHIBITION_YEAR` constant in [`constants.ts`](../src/lib/constants.ts) auto-calculates based on date:

- Before April 1st → current year
- After April 1st → next year (since March exhibition)

Use this constant everywhere, never hardcode years.

### Constants Reference

#### Core Business Constants

- **EXHIBITION_YEAR**: Auto-calculated exhibition year based on current date
- **GENERIC_ERROR_MESSAGE**: Standard user-facing error message
- **GENERIC_ERROR_UNEXPECTED**: Fallback error for unexpected failures

#### Image Management Constants

- **MAX_IMAGE_SIZE**: 5MB file size limit
- **MAX_IMAGES_UI_LIMIT**: 3 images per entry (UI display limit)
- **MIN_IMAGES_PER_ENTRY**: 1 image minimum requirement
- **DEFAULT_PRIMARY_IMAGE_INDEX**: 0 (first image as default primary)

#### Cloudinary Presets

- **CLOUDINARY_PRESET_UNATTACHED**: For images not yet linked to entries
- **CLOUDINARY_PRESET_ENTRY**: For images uploaded to specific entries

#### Pricing Constants

- **BASE_REGISTRATION_COST**: $20 base registration fee
- **PER_ENTRY_COST**: $20 per artwork entry
- Prices stored in database as cents, converted to dollars for display
- Use `centsToDisplay()` and `displayToCents()` utility functions

#### UI Constants (UI_CONSTANTS)

```typescript
UI_CONSTANTS = {
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

#### Other Constants

- **DIMENSION_SEPARATOR**: 'x' (for displaying dimensions)
- **ADMIN_DOMAIN**: 'sculpturebermagui.org.au' (admin email domain)
- **REGISTRATIONS_OPEN**: Boolean from environment variable (feature flag)

### Multi-Image Management

- UI limit: 3 images per entry (`MAX_IMAGES_UI_LIMIT`)
- Database supports unlimited images
- Primary image designation via `primaryImageTable`
- Helper methods in `RegisterState`: `addWorkingImage()`, `removeWorkingImage()`, `setPrimaryImage()`
- Minimum 1 image required (`MIN_IMAGES_PER_ENTRY`)

### User Roles & Proxy Functionality

Set in [`hooks.server.ts`](../src/hooks.server.ts):

- **Admin**: Email domain `@sculpturebermagui.org.au`
- **Super Admin**: Specific usernames (george, david, webmaster)
- Super admins can proxy as any artist via `user.proxyEmail`

Always check `isSuperAdmin` before enabling proxy features:

```typescript
const artistEmail = user.isSuperAdmin ? user.proxyEmail : user.email;
```

### Pricing Convention

- Store prices in **cents** in database (`price_in_cents`)
- Display in dollars in UI
- Registration: $20 base + $20 per entry

## Development Workflows

### Database Operations

```bash
pnpm run db:migrate        # Run pending migrations
pnpm run db:reset          # Reset database (dev only!)
pnpm run db:seed           # Seed with faker data
pnpm studio                # Open Prisma Studio
```

### Running TypeScript Scripts

Always use `npx tsx` for scripts:

```bash
npx tsx scripts/data-migration-primary-images.ts
npx tsx src/scripts/seed.ts
```

Scripts are in two locations:

- `/scripts/` - Data migration and validation scripts
- `/src/scripts/` - Development utilities (seed, upload, etc.)

### Build & Deploy

```bash
pnpm dev                   # Local dev server
pnpm build                 # Production build
pnpm netlify-build         # Netlify build (includes prisma generate)
```

**Important**: Netlify build requires `prisma generate` before `vite build`.

## File Naming Conventions

- Components: `kebab-case.svelte` (e.g., `artist-create-form.svelte`)
- Server files: `+page.server.ts`, `+layout.server.ts`
- Database fields: `snake_case` (Prisma schema)
- TypeScript: `camelCase` for variables, `PascalCase` for types/classes
- Constants: `UPPER_SNAKE_CASE`

## Component Patterns

### Import Organization

```typescript
// 1. SvelteKit imports
import { goto } from '$app/navigation';
import { page } from '$app/state'; // Note: $app/state in Svelte 5

// 2. External libraries
import { toast } from 'svelte-sonner';

// 3. UI components (bits-ui pattern)
import * as Card from '$lib/components/ui/card/index.js';
import { Button } from '$lib/components/ui/button';

// 4. Local utilities
import { EXHIBITION_YEAR } from '$lib/constants';
import { prisma } from '$lib/server/prisma';
```

### bits-ui Component Usage

```svelte
<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
</script>

<Dialog.Root bind:open={dialogState}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Title</Dialog.Title>
		</Dialog.Header>
		<!-- Content -->
	</Dialog.Content>
</Dialog.Root>
```

## Cloudinary Integration

Upload pattern (see [`cloudinary.ts`](../src/lib/components/server/cloudinary.ts)):

- Upload via `uploadImageToCloudinary(image, preset)`
- Store `cloudId` and `cloudURL` in `imageTable`
- Frontend uses `svelte-cloudinary` for optimized display
- Supports HEIC conversion automatically

## Data Migration Patterns

When migrating data (see [`data-migration-primary-images.ts`](../scripts/data-migration-primary-images.ts)):

1. Log start and progress clearly (`🚀`, `📊`, `✅`, `❌` emojis)
2. Check if migration needed (avoid duplicate runs)
3. Process in batches with error collection
4. Log summary statistics at end
5. Always use transactions for multi-step operations

## Type Safety

### Prisma-Generated Types

Extract types from Prisma queries:

```typescript
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
export type Submission = ThenArg<ReturnType<typeof getSubmission>>;
```

### Zod Schemas

All validation schemas in [`zod-schemas.ts`](../src/lib/zod-schemas.ts):

- Database table schemas (`artistTableSchema`, etc.)
- UI form schemas with `.refine()` for custom validation
- Export both schema and inferred type

## Common Pitfalls to Avoid

1. **Never use Svelte 4 patterns** - This is a Svelte 5 project with runes
2. **Don't forget cascade deletes** - Related records auto-delete with parent
3. **Never hardcode years** - Use `EXHIBITION_YEAR` constant
4. **Price storage** - Always in cents, convert for display
5. **Proxy email** - Check `isSuperAdmin` before using `proxyEmail`
6. **Image limits** - Respect `MAX_IMAGES_UI_LIMIT` in UI
7. **Error logging** - Always prefix with `event.route.id`
8. **Form IDs** - Superforms require unique IDs when multiple forms exist
9. **Import paths** - Use `$app/state` not `$app/stores` in Svelte 5

## Environment Variables

Required in `.env.local`:

```bash
DATABASE_URL=                      # PostgreSQL connection
PUBLIC_SUPABASE_URL=              # Supabase project URL
PUBLIC_SUPABASE_ANON_KEY=         # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=        # Supabase service role
CLOUDINARY_CLOUD_NAME=            # Cloudinary config
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GMAIL_USER=                       # Nodemailer config
GMAIL_APP_PASSWORD=
PUBLIC_REGISTRATIONS_OPEN=YES|NO  # Feature flag
```

## Features

When implementing features in the "FEATURES.md" file check off the features as they are completed.

## Key Files Reference

- **State management**: [`src/lib/context.svelte.ts`](../src/lib/context.svelte.ts)
- **Business constants**: [`src/lib/constants.ts`](../src/lib/constants.ts)
- **Database queries**: [`src/lib/components/server/registrationDB.ts`](../src/lib/components/server/registrationDB.ts)
- **Validation**: [`src/lib/zod-schemas.ts`](../src/lib/zod-schemas.ts)
- **Auth hooks**: [`src/hooks.server.ts`](../src/hooks.server.ts)
- **Schema**: [`prisma/schema.prisma`](../prisma/schema.prisma)
