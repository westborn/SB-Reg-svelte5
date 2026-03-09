# Sculpture Bermagui Registration System - Project Setup

## Project Overview

This is a **SvelteKit 5** application (using modern Svelte with runes) for managing artist registrations and artwork submissions for an annual sculpture exhibition.

**Tech Stack**: SvelteKit 5 + TypeScript + PostgreSQL/Prisma + Supabase Auth + Tailwind/shadcn-svelte + Cloudinary + Nodemailer

## Creating a New Project from Scratch

If you're setting up a similar project, follow these steps:

```bash
# Create SvelteKit project with TypeScript
pnpm create svelte@latest ./
# Select: Skeleton project, TypeScript syntax, Prettier, Playwright

# Add Tailwind CSS
pnpm dlx svelte-add@latest tailwindcss

# Install dependencies
pnpm i

# Add development tools
pnpm i -D prettier prettier-plugin-svelte

# Initialize shadcn-svelte
pnpm dlx shadcn-svelte@latest init
```

## Adding shadcn-svelte Components

```bash
# Initialize shadcn-svelte (if not done above)
npx shadcn-svelte@latest init

# Install form validation dependencies
pnpm i -D zod
pnpm i formsnap sveltekit-superforms zod

# Install dark mode support
pnpm i mode-watcher

# Add UI components (adjust as needed)
pnpm dlx shadcn-svelte@latest add alert-dialog avatar button card dialog form input label textarea tooltip sonner radio-group
```

## Tailwind Theme Configuration

Update `src/app.css` with custom theme colors:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
	:root {
		--background: 0 0% 100%;
		--foreground: 222.2 84% 4.9%;
		--card: 0 0% 100%;
		--card-foreground: 222.2 84% 80%;
		--popover: 0 0% 100%;
		--popover-foreground: 222.2 84% 4.9%;
		--primary: 221.2 83.2% 53.3%;
		--primary-foreground: 210 40% 98%;
		--secondary: 210 40% 96.1%;
		--secondary-foreground: 222.2 47.4% 11.2%;
		--muted: 210 40% 96.1%;
		--muted-foreground: 215.4 16.3% 46.9%;
		--accent: 210 40% 96.1%;
		--accent-foreground: 222.2 47.4% 11.2%;
		--destructive: 0 72.22% 50.59%;
		--destructive-foreground: 210 40% 98%;
		--border: 214.3 31.8% 91.4%;
		--input: 214.3 31.8% 91.4%;
		--ring: 221.2 83.2% 53.3%;
		--radius: 1rem;
	}
	.dark {
		--background: 222.2 84% 4.9%;
		--foreground: 210 40% 98%;
		--card: 222.2 84% 4.9%;
		--card-foreground: 210 40% 98%;
		--popover: 222.2 84% 4.9%;
		--popover-foreground: 210 40% 98%;
		--primary: 217.2 91.2% 59.8%;
		--primary-foreground: 222.2 47.4% 11.2%;
		--secondary: 217.2 32.6% 17.5%;
		--secondary-foreground: 210 40% 98%;
		--muted: 217.2 32.6% 17.5%;
		--muted-foreground: 215 20.2% 65.1%;
		--accent: 217.2 32.6% 17.5%;
		--accent-foreground: 210 40% 98%;
		--destructive: 0 62.8% 30.6%;
		--destructive-foreground: 210 40% 98%;
		--border: 217.2 32.6% 17.5%;
		--input: 217.2 32.6% 35%;
		--ring: 224.3 76.3% 48%;
	}
}

@layer base {
	* {
		@apply border-border;
	}
	body {
		@apply bg-background text-foreground;
	}
}
```

**Theme Tool**: Use https://ui.jln.dev/ to generate custom color schemes.

## Dark Mode Default

Update `src/app.html` to set dark mode by default:

```html
<html lang="en" class="dark" style="color-scheme: dark"></html>
```

## Prisma Setup

```bash
# Install Prisma
pnpm install prisma --save-dev

# Initialize Prisma
pnpm dlx prisma init
```

### Prisma Configuration

Edit `prisma/schema.prisma`:

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["relationJoins"]
  binaryTargets   = ["native", "rhel-openssl-3.0.x"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Note**: This project uses single schema (no `multiSchema` needed). Binary targets added for Netlify deployment.

### Initial Database Setup

For a **new database**, create your schema in `prisma/schema.prisma` and run:

```bash
# Create initial migration
pnpm prisma migrate dev --name init
```

For an **existing Supabase database**:

```bash
# Pull existing schema
pnpm prisma db pull

# Create baseline migration
pnpm prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script \
  --output prisma/migrations/0_init/migration.sql

# Mark as applied
pnpm prisma migrate resolve --applied 0_init
```

## Supabase Authentication

```bash
# Install Supabase client
pnpm install @supabase/ssr @supabase/supabase-js
```

### Environment Variables

Create `.env.local`:

```bash
DATABASE_URL="postgresql://..."
PUBLIC_SUPABASE_URL="https://..."
PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
LOG_LEVEL="INFO"  # DEBUG, INFO, WARN, ERROR, OFF
```

### Auth Setup

Implement authentication in `src/hooks.server.ts` using `@supabase/ssr` pattern (see project file for full implementation).

## Cloudinary Integration

```bash
# Install Cloudinary
pnpm install cloudinary

# Frontend optimization
pnpm install svelte-cloudinary
```

Add to `.env.local`:

```bash
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
PUBLIC_CLOUDINARY_CLOUD_NAME="..."
LOG_LEVEL="INFO"  # Optional: DEBUG, INFO, WARN, ERROR, OFF (defaults to INFO)
```

## Email with Nodemailer

```bash
pnpm install nodemailer
pnpm install -D @types/nodemailer
```

Add to `.env.local`:

```bash
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-app-password"
```

## Additional Dependencies

```bash
# Utilities used in this project
pnpm install lucide-svelte svelte-sonner
```

## Development Scripts

Add to `package.json`:

```json
{
	"scripts": {
		"dev": "vite dev",
		"build": "vite build",
		"preview": "vite preview",
		"check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
		"check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
		"db:migrate": "prisma migrate dev",
		"db:reset": "prisma migrate reset",
		"db:seed": "npx tsx src/scripts/seed.ts",
		"studio": "prisma studio",
		"netlify-build": "prisma generate && vite build"
	}
}
```

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── server/          # Server-side utilities
│   │   │   ├── prisma.ts
│   │   │   ├── registrationDB.ts
│   │   │   └── cloudinary.ts
│   │   └── ui/              # shadcn-svelte components
│   ├── constants.ts         # Business logic constants
│   ├── context.svelte.ts    # Svelte 5 state management
│   └── zod-schemas.ts       # Validation schemas
├── routes/
│   ├── +layout.svelte
│   ├── +page.svelte
│   ├── register/
│   │   ├── +layout.server.ts
│   │   └── [route]/+page.svelte
│   └── admin/
├── hooks.server.ts          # Auth & route guards
└── app.html
```

## Svelte 5 Specific Notes

This project uses **Svelte 5 with runes**. Key differences from Svelte 4:

```typescript
// ✅ Svelte 5 patterns
let count = $state(0);
let doubled = $derived(count * 2);
$effect(() => {
	console.log(count);
});

// Import from $app/state, not $app/stores
import { page } from '$app/state';
```

**Never use legacy Svelte 4 patterns** (`$:`, `export let`, `$app/stores`).

## Deployment (Netlify)

1. **Build command**: `pnpm netlify-build` (includes `prisma generate`)
2. **Binary targets**: Already configured in schema for RHEL/OpenSSL 3.0.x
3. **Environment variables**: Set all `.env.local` vars in Netlify dashboard
4. **Database**: Use Supabase PostgreSQL connection string

## Key Resources

- **SvelteKit**: https://kit.svelte.dev/
- **Svelte 5**: https://svelte-5-preview.vercel.app/docs
- **shadcn-svelte**: https://www.shadcn-svelte.com/
- **Prisma**: https://www.prisma.io/docs
- **Supabase**: https://supabase.com/docs
- **Theme Generator**: https://ui.jln.dev/

## Common Issues & Solutions

### Form Errors Display

Extend shadcn-svelte forms to add custom error display (see `src/lib/components/ui/form` directory).

### Prisma Client Not Found

Always run `prisma generate` after schema changes or in build pipeline.

### Dark Mode Not Working

Ensure `mode-watcher` is installed and initialized in root layout.

### Type Errors with Prisma

Use type extraction patterns shown in `registrationDB.ts` for complex queries.

## Next Steps After Setup

1. Configure Prisma schema based on your needs
2. Set up authentication flows
3. Create form validation schemas with Zod
4. Implement state management with context
5. Build UI components using shadcn-svelte
6. Add server actions for form handling
7. Implement image upload with Cloudinary
8. Test authentication and authorization flows

---

**Note**: This scaffold reflects the setup of a working SvelteKit 5 + Prisma + Supabase + Cloudinary application. Adjust dependencies and configuration based on your specific requirements.
