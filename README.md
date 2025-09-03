# Sculpture Bermagui Registration System

## Overview

The Sculpture Bermagui Registration System is a modern web application built with SvelteKit 5 that manages the complete lifecycle of artist registrations and artwork submissions for the annual sculpture exhibition. This system handles everything from initial artist registration through exhibition management and logistics.

## 📈 Current Status

**Version**: 1.4.2  
**Exhibition Year**: 2025 (Automatically calculated)

### **2025 Registrations now CLOSED**

This system successfully manages the annual Sculpture Bermagui exhibition with support for:

- Multi-year exhibitions with historical data
- Scalable artist and artwork management
- Comprehensive administrative tools
- Modern, responsive user interface
- Robust data migration capabilities
- **Full test coverage** with automated testing

Built with modern web technologies and designed for scalability, this system continues to evolve to meet the growing needs of the Sculpture Bermagui community.

## 🎨 What This System Does

### For Artists

- **Register for the exhibition** with personal and banking details
- **Submit artwork entries** with detailed descriptions, materials, and dimensions
- **Upload images** of their artwork via Cloudinary integration
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
- **UI Framework**: Tailwind CSS with Shadcn-svelte components
- **Image Storage**: Cloudinary
- **Email**: Nodemailer with Gmail integration
- **Deployment**: Netlify
- **Package Manager**: pnpm

## 📊 Key Features

### Registration Workflow

1. **Artist Registration** - Basic contact and banking information
2. **Entry Submission** - Artwork details with image uploads
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
- **Image Migration** from Google Drive to Cloudinary
- **Database Migrations** with Prisma
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

# Testing
pnpm test                  # Run tests in watch mode
pnpm test:run              # Run tests once
pnpm test:ui               # Run tests with UI interface
pnpm test:coverage         # Run tests with coverage report

# Code Quality
pnpm check                 # Type checking
pnpm lint                  # ESLint
pnpm format                # Prettier formatting

# Versioning
pnpm bump:patch            # Bump patch version
pnpm bump:minor            # Bump minor version
pnpm bump:major            # Bump major version
```

## 🧪 Testing

This project includes a comprehensive testing setup with:

- **Vitest** for unit and integration testing
- **Testing Library** for component testing
- **Jest DOM** for enhanced DOM assertions
- **Coverage reporting** with detailed metrics
- **CI/CD integration** with GitHub Actions

### Test Structure

```
src/
├── lib/
│   ├── utils.test.ts           # Utility function tests
│   ├── zod-schemas.test.ts     # Schema validation tests
│   └── theme-toggle.test.ts    # Component tests
└── tests/
    ├── setup.ts               # Test environment setup
    └── example.test.ts         # Example test patterns
```

### Running Tests

```bash
# Development (watch mode)
pnpm test

# Single run (CI)
pnpm test:run

# With coverage
pnpm test:coverage

# Interactive UI
pnpm test:ui
```

For detailed testing documentation, see [docs/TESTING.md](docs/TESTING.md).

## 📁 Project Structure

```
src/
├── lib/
│   ├── components/         # Reusable UI components
│   ├── server/            # Server-side utilities
│   └── data/              # Historical JSON data
├── routes/
│   ├── (app)/             # Main application routes
│   ├── (auth)/            # Authentication routes
│   └── api/               # API endpoints
├── scripts/               # Data migration and utility scripts
└── prisma/                # Database schema and migrations
```

## 🔧 Configuration

The system uses environment variables for configuration:

- Database connection (PostgreSQL)
- Supabase authentication
- Cloudinary image storage
- Email service (Gmail)
- Payment processing
- Exhibition year settings
