# GitHub Copilot Instructions

This document provides context and guidelines for GitHub Copilot when working with the Sculpture Bermagui Registration System.

## Project Overview

This is a **SvelteKit 5** application managing artist registrations and artwork submissions for an annual sculpture exhibition. The system handles the complete lifecycle from artist registration through exhibition management.

## Technology Stack

- **Frontend**: SvelteKit 5 with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth
- **UI**: Tailwind CSS + bits-ui components (shadcn-svelte style)
- **Images**: Cloudinary integration
- **Email**: Nodemailer with Gmail
- **Package Manager**: pnpm

## Key Architectural Patterns

### Database Schema

- `artistTable`: Core artist information
- `registrationTable`: Annual registration records
- `entryTable`: Individual artwork submissions
- `imageTable`: Artwork images via Cloudinary
- `primaryImageTable`: Primary image designation for entries
- `locationTable`: Exhibition placement info

### Route Structure

- `(app)/`: Main authenticated application
- `(auth)/`: Authentication flows
- `api/`: Server endpoints
- File-based routing with `+page.svelte`, `+page.server.ts`, `+layout.svelte`

### State Management

- Svelte 5 runes (`$state`, `$derived`, `$effect`)
- Context API for shared state (`context.svelte.ts`)
- Form validation with `sveltekit-superforms` + Zod

## Code Conventions

### File Naming

- Components: `kebab-case.svelte` (e.g., `artist-create-form.svelte`)
- Types: `PascalCase` interfaces/types
- Constants: `UPPER_SNAKE_CASE` exports
- Database fields: `snake_case` (Prisma schema)

### Import Patterns

```typescript
// Svelte imports
import { goto } from '$app/navigation';
import { page } from '$app/state'; // Note: uses $app/state in Svelte 5

// Library imports
import * as Card from '$lib/components/ui/card/index.js';
import { EXHIBITION_YEAR } from '$lib/constants';
import { Button } from '$lib/components/ui/button';

// Prisma/DB
import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';
```

### Component Structure

```svelte
<script lang="ts">
	// Imports
	// Props/state
	// Derived values
	// Functions/event handlers
</script>

<!-- Markup with Tailwind classes -->

<style>
	/* Minimal custom styles */
</style>
```

## Key Business Logic

### Exhibition Years

- Automatically calculated in `EXHIBITION_YEAR` constant
- Based on March exhibition date (before April 1st = current year, after = next year)
- System supports multiple years (2023, 2024, 2025)

### Registration Flow

1. Artist registration (personal/banking details)
2. Entry submission (artwork details + images)
3. Confirmation (review logistics)
4. Payment processing
5. Email confirmation

### User Types

- **Artists**: Register and submit entries
- **Admins**: Manage exhibitions, review entries
- **Super Admins**: Proxy functionality for any artist

### Pricing

- Registration: $20 base + $20 per entry
- Prices stored in cents in database
- Display in dollars in UI

## Common Patterns

### Form Handling

```typescript
// Use superforms with Zod validation
import { superForm } from 'sveltekit-superforms';
import { zodClient } from 'sveltekit-superforms/adapters';

const form = superForm(data.form, {
	validators: zodClient(schema)
	// ... options
});
```

### Database Queries

```typescript
// Use Prisma with proper error handling
try {
	const result = await prisma.artistTable.findUnique({
		where: { email },
		include: { registrations: true }
	});
} catch (error) {
	console.error(`${event.route.id} - `, error);
	return fail(500, { message: GENERIC_ERROR_MESSAGE });
}
```

### Image Handling

- Upload to Cloudinary via `svelte-cloudinary`
- Store cloudId and cloudURL in database
- Lazy loading with optimized images

## Environment Variables

```bash
# Database
DATABASE_URL=

# Supabase Auth
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email
GMAIL_USER=
GMAIL_APP_PASSWORD=

# App Config
PUBLIC_REGISTRATIONS_OPEN=YES|NO
```

## Development Guidelines

### Script Execution

- Use `npx tsx scripts/script-name.ts` to run TypeScript scripts
- Common scripts include validation, data migration, and seeding
- Scripts are located in `scripts/` directory
- Use `pnpm run db:seed` for database seeding

### When suggesting code:

1. **Use TypeScript** - Full type safety with Prisma-generated types
2. **Follow Svelte 5** - Use runes, not legacy reactivity
3. **Error handling** - Always wrap database calls in try/catch
4. **Validation** - Use Zod schemas for form validation
5. **Accessibility** - Include proper ARIA labels and semantic HTML
6. **Responsive** - Mobile-first Tailwind classes
7. **Performance** - Lazy load images, optimize queries

### Avoid:

- Legacy Svelte 4 patterns (`let:`, `export let`)
- Direct DOM manipulation (use Svelte reactivity)
- Inline styles (use Tailwind utilities)
- Hardcoded strings (use constants)
- Missing error boundaries
- Non-accessible components

## Testing Patterns

### Database Testing

- Use Prisma migrations for schema changes
- Seed data via `src/scripts/seed.ts`
- Historical data import via upload scripts

### Component Testing

- Focus on form validation and user interactions
- Test error states and loading states
- Verify accessibility requirements

## Common Debugging

### Database Issues

- Check Prisma schema matches migrations
- Verify foreign key relationships
- Use `pnpm studio` for data inspection
- Use `pnpm run db:migrate` for schema changes
- Use `pnpm run db:reset` to reset database

### Authentication Issues

- Verify Supabase configuration
- Check user session in `hooks.server.ts`
- Test with different user roles

### Image Upload Issues

- Verify Cloudinary credentials
- Check file size limits (5MB max)
- Ensure proper MIME type handling

## Features

When implementing features in the "FEATURES.md" file check off the features as they are completed.
