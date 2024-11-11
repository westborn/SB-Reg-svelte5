# Release 1.0 - 2025 exhibition registration open

# Setup the Project

Everything you need to build a Svelte project with sveltekit, tailwind and shadcn-svelte!

## Creating a project

Standard setup from the docs for sveltekit, tailwind and shadcn-svelte!

```bash
pnpm create svelte@latest ./
pnpm dlx svelte-add@latest tailwindcss
pnpm i
pnpm i -D prettier prettier-plugin-svelte
pnpm dlx shadcn-svelte@latest init

```

## Adding shadcn-svelte components with super-forms, formsnap and zod

```bash
npx shadcn-svelte@latest init
pnpm i -D zod
pnpm i formsnap sveltekit-superforms zod
pnpm i mode-watcher

pnpm dlx shadcn-svelte@latest add alert-dialog avatar button card dialog form input lable textarea tooltip sonner

```

## Update the Shadcn theme to the colours you like.

### Use this website - https://ui.jln.dev/

```
@tailwind base;
@tailwind components;
@tailwind utilities;

/* from shadcn-svelte theme creator - https://www.shadcn-svelte.com/themes */
/*		Change dark mode input */
/*		from	--input: 217.2 32.6% 17.5%; */
/*		to:		--input: 217.2 32.6% 35%; */

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

## Make darkmode the default in app.html

```
<html lang="en" class="dark" style="color-scheme: dark">
```

form errors fix in huntabyte's youtube
https://www.youtube.com/watch?v=vz8y2Nnz7T4&t=406s
3:12:28 you can extend Shadcn to add our own little errors

## Add prisma

prisma db pull - turn your database schema into a Prisma schema.  
prisma generate - generate the Prisma Client.

```
pnpm install prisma --save-dev
pnpm dlx prisma init
```

edit the prisma.schenas file to add provision for auth

```
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["auth", "public"]
}

```

### Prisma fix for supabase Auth

We need to setup an initial migration to make sure the auth tables are in our schema, but, we don't ever update them

Use prisma pull to sync existing supabase with prisma and then tell prisma that we have completed this migation

```
pnpm prisma db pull
pnpm prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script --output prisma/migrations/0_init/migration.sql
pnpm prisma migrate resolve --applied 0_init
```
