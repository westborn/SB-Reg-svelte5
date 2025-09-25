# Sculpture Bermagui Registration System

## Overview

The Sculpture Bermagui Registration System is a modern web application built with SvelteKit 5 that manages the complete lifecycle of artist registrations and artwork submissions for the annual sculpture exhibition. This system handles everything from initial artist registration through exhibition management and logistics.

## 📈 Current Status

**Version**: 1.5.2  
**Exhibition Year**: 2025 (Automatically calculated)

### **2025 Registrations now CLOSED**

This system successfully manages the annual Sculpture Bermagui exhibition with support for:

- Multi-year exhibitions with historical data
- Scalable artist and artwork management
- Comprehensive administrative tools
- Modern, responsive user interface
- Robust data migration capabilities

Built with modern web technologies and designed for scalability, this system continues to evolve to meet the growing needs of the Sculpture Bermagui community.

## ✨ Recent Major Features

- **Multiple Images Support**: Artists can now upload up to 3 images per entry with primary image designation
- **Database Schema Evolution**: Added primary image table with complete data migration and validation
- **Enhanced Image Management**: Full CRUD operations for images with integrity validation
- **Validation Scripts**: Comprehensive data integrity checking for image relationships

## 🎨 What This System Does

### For Artists

- **Register for the exhibition** with personal and banking details
- **Submit artwork entries** with detailed descriptions, materials, and dimensions
- **Upload multiple images** (up to 3 per entry) with primary image designation via Cloudinary integration
- **Manage registration logistics** including bump-in/bump-out schedules and special requirements
- **Receive email confirmations** with registration summaries and payment instructions

### For Administrators

- **Manage exhibitions** across multiple years (2023, 2024, 2025)
- **Review and approve entries** for the exhibition
- **Assign exhibit locations** and numbers to accepted works
- **Handle logistics** including crane requirements, accommodation, and transport
- **Export data** for external systems and reporting
- **Proxy functionality** to manage registrations on behalf of artists

### Exhibition Management

- **Multi-year support** with configurable exhibition years
- **Entry categorization** (Indoor/Outdoor sculptures)
- **Major prize tracking** for competition entries
- **Pricing management** for artwork sales
- **Location assignment** for physical exhibition layout

## 🚀 Technology Stack

- **Frontend**: SvelteKit 5 with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth
- **UI Framework**: Tailwind CSS with bits-ui components (shadcn-svelte style)
- **Image Storage**: Cloudinary
- **Email**: Nodemailer with Gmail integration
- **Deployment**: Netlify
- **Package Manager**: pnpm

## 📊 Key Features

### Registration Workflow

1. **Artist Registration** - Basic contact and banking information
2. **Entry Submission** - Artwork details with multiple image uploads (up to 3 per entry)
3. **Confirmation** - Review and finalize registration
4. **Payment** - Integration with payment processing
5. **Email Confirmation** - Detailed registration summary

### Administrative Tools

- **Admin Dashboard** for managing all registrations
- **Bulk Operations** for handling multiple entries
- **Data Migration** scripts for importing historical data
- **Exhibition Queries** with advanced filtering and pagination
- **Report Generation** for various stakeholders

### Data Management

- **Historical Data** support for previous exhibitions (2023, 2024)
- **Multiple Images** support with primary image designation and validation
- **Image Migration** from Google Drive to Cloudinary
- **Database Migrations** with Prisma and data integrity validation
- **Seed Scripts** for development data

## 🛠 Development Commands

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm preview                # Preview production build

# Database
pnpm db:migrate            # Run database migrations
pnpm db:reset              # Reset database
pnpm db:seed               # Seed development data
pnpm studio                # Open Prisma Studio

# Code Quality
pnpm check                 # Type checking
pnpm lint                  # ESLint
pnpm format                # Prettier formatting

# Scripts
npx tsx scripts/script-name.ts  # Run TypeScript scripts
npx tsx scripts/validate-primary-images.ts  # Validate image data integrity

# Versioning
pnpm bump:patch            # Bump patch version
pnpm bump:minor            # Bump minor version
pnpm bump:major            # Bump major version
```

## 📁 Project Structure

```
src/
├── lib/
│   ├── components/         # Reusable UI components (including multiple image management)
│   ├── server/            # Server-side utilities
│   └── data/              # Historical JSON data
├── routes/
│   ├── (app)/             # Main application routes
│   ├── (auth)/            # Authentication routes
│   └── api/               # API endpoints (including image management)
├── scripts/               # Data migration and utility scripts (validation, migration)
└── prisma/                # Database schema and migrations (including primary image table)
```

## 🔧 Configuration

The system uses environment variables for configuration:

- Database connection (PostgreSQL)
- Supabase authentication
- Cloudinary image storage
- Email service (Gmail)
- Payment processing
- Exhibition year settings
