# 2025 Registrations PRD

## Product Overview

The Sculpture Bermagui Registration System is a web application built with SvelteKit 5 that manages artist registrations and artwork submissions for the annual sculpture exhibition. The system handles the complete lifecycle from artist registration to exhibition management.

## Current Status

**2025 Registrations are now CLOSED** as indicated in the [README.md](README.md).

## Technology Stack

- **Frontend**: SvelteKit 5 with TypeScript
- **UI Components**: Shadcn-svelte with custom theming
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth integration
- **Styling**: Tailwind CSS with custom color scheme
- **File Management**: Cloudinary for image storage

## Core Features

### 1. Artist Registration System

- **Artist Profile Management**: Store artist details including contact information, banking details, and First Nations status
- **Registration Creation**: Annual registration system with configurable years ([`EXHIBITION_YEAR`](src/lib/constants.ts))
- **Registration Status**: Track open/closed status with admin toggle functionality ([`toggleOpenClosed`](src/routes/api/toggleOpenClosed/+server.ts))

### 2. Artwork Entry Management

- **Entry Creation**: Artists can submit artwork entries with details like title, materials, dimensions, and descriptions
- **Entry Types**: Support for both indoor and outdoor entries ([`EntryType`](src/lib/constants.ts))
- **Major Prize Entry**: Option to enter works into major prize competition
- **Pricing**: Price tracking in cents for artwork sales

### 3. Image Management

- **Image Upload**: Integration with Cloudinary for artwork image storage
- **Image Association**: Link images to specific entries

### 4. Exhibition Management

- **Location Assignment**: Assign exhibit numbers and locations to accepted entries
- **Acceptance Status**: Track which entries are accepted for the exhibition
- **Logistics**: Manage bump-in/bump-out schedules, display requirements, and crane needs

### 5. Administrative Features

- **Super Admin Access**: Proxy functionality for admins to manage other users' registrations
- **Data Migration**: Scripts for importing historical data from previous years ([2023Upload.ts](src/scripts/2023Upload.ts), [2024Upload.ts](src/scripts/2024Upload.ts))
- **Exhibition Queries**: Comprehensive queries for accepted exhibits ([`getExhibits`](src/lib/components/server/registrationDB.ts))

## Database Schema

The system uses a multi-table structure:

- **ArtistTable**: Core artist information
- **RegistrationTable**: Annual registration records
- **EntryTable**: Individual artwork submissions
- **ImageTable**: Artwork images
- **LocationTable**: Exhibition placement information

## User Interface

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Custom Theme**: Blue-green color scheme with custom CSS variables in [app.pcss](src/app.pcss)
- **Component Library**: Reusable UI components using Shadcn-svelte including:
  - Dialog components for modals
  - Sheet components for side panels
  - Form components with validation
  - Consistent styling across the application

## Authentication & Authorization

- **Supabase Integration**: User authentication through Supabase
- **Role-based Access**: Super admin functionality for managing multiple artist accounts
- **Email-based Identity**: Primary identification through email addresses

## Data Migration & Historical Support

- **Multi-year Support**: Handle data from 2023, 2024, and 2025 exhibitions
- **Import Scripts**: Automated scripts for migrating data from previous systems
- **Image Mapping**: Google Drive to Cloudinary migration support

## Configuration

- **Environment Variables**: Secure configuration through `.env` files
- **Exhibition Year**: Configurable current exhibition year
- **Theme Customization**: Easy color scheme updates through CSS variables

## Development Features

- **Type Safety**: Full TypeScript integration with Prisma-generated types
- **Code Quality**: ESLint and Prettier configuration
- **Build System**: Vite-based build with SvelteKit
- **Database Management**: Prisma migrations and schema management

## Privacy & Legal

- **Terms of Service**: Links to organization's terms and privacy policy
- **Data Protection**: Secure handling of artist personal and banking information

## Future Considerations

- The system is designed to handle annual exhibitions with year-based configuration
- Extensible architecture for adding new features and exhibition types
- Scalable database design for growing artist and artwork collections
