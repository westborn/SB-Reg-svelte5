# Architecture Documentation

## Technology Stack

### Frontend

- **Framework**: SvelteKit 5 with TypeScript
- **UI Components**: bits-ui with shadcn-svelte styling
- **Styling**: Tailwind CSS v4 with custom theme, integrated via the Vite plugin
- **State Management**: Svelte 5 runes with context API
- **Form Handling**: sveltekit-superforms with Zod validation

### Frontend Build Notes

- **Tailwind entry file**: [src/app.css](src/app.css)
- **Tailwind integration**: Vite plugin in [vite.config.ts](vite.config.ts)
- **PostCSS**: not used in the current styling pipeline
- **Superforms adapter path**: app code uses `sveltekit-superforms/adapters`, resolved by Vite to the local Zod-only shim in [src/lib/superforms-zod.ts](src/lib/superforms-zod.ts) to avoid client-side VineJS bundling warnings

### Backend

- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth
- **File Storage**: Cloudinary for images
- **Email**: Nodemailer with Gmail

### Build & Deploy

- **Build System**: Vite with SvelteKit adapter
- **Deployment**: Netlify
- **Package Manager**: pnpm

## Database Schema

[Include schema diagram or reference to schema.prisma]

## Key Architecture Patterns

[Move technical patterns from PRD here]

## API Endpoints

[Document key API routes]

## Security Model

[Document authentication and authorization]

## Development Workflow

[Document setup, testing, deployment]
