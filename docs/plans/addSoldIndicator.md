# Add Sold Indicator Implementation Plan

## Overview

Implement a "sold" indicator for artwork entries to track which pieces have been sold during or after the exhibition. This feature will add a simple boolean field to the entry table and update all relevant UI components to display and manage the sold status.

## Current System Analysis

### Database Schema

- **entryTable**: Contains artwork entries with fields like `accepted`, `price`, etc.
- **Exhibit Type**: Used in admin views and public catalog
- **UI Components**: `catalogue-card.svelte`, `entry-card.svelte`, admin list views

### Current Price Display

- Prices stored as `price_in_cents` in database
- Displayed using `convertToDollars()` utility function
- Shown in catalog cards, entry cards, and admin tables

## Implementation Plan

### Phase 1: Database Schema Updates

#### 1.1 Update Prisma Schema

Add `sold` boolean field to `entryTable` in `prisma/schema.prisma`:

```prisma
model entryTable {
  // ...existing fields...
  price               Int                @map("price_in_cents")
  sold                Boolean            @default(false)
  specialRequirements String?            @map("special_requirements")
  // ...rest of existing fields...
}
```

#### 1.2 Create Migration

- Generate Prisma migration for the new `sold` field
- All existing entries will default to `sold: false`

#### 1.3 Update Type Definitions

- Add `sold` field to `Exhibit` type in `registrationDB.ts`
- Update any other relevant TypeScript interfaces

### Phase 2: Backend API Updates

#### 2.1 Update Database Queries

- Modify `getExhibits()` query in `registrationDB.ts` to include `sold` field
- Add `entry.sold` to the SELECT statement in the raw SQL query

#### 2.2 Update Zod Schemas

- Add `sold` field to relevant schemas in `src/lib/zod-schemas.ts`
- Update type definitions for consistency

### Phase 3: Public Display Updates

#### 3.1 Update Entry Card Component

- Modify `src/lib/components/entry-card.svelte`
- Add sold indicator for user's own entries
- Update price display logic for sold items

## Technical Considerations

### Database Performance

- Index on `sold` field if needed for large datasets
- Consider impact on existing queries

### Data Migration

- All existing entries will default to `sold: false`
- No data migration needed since it's a new boolean field
- Sold status will need to be updated manually in the database when items are sold

### Backward Compatibility

- New field is optional/defaulted, won't break existing functionality
- UI updates are additive, won't affect existing layouts

### Security

- Sold status updates will require direct database access
- No API endpoints needed for updating sold status
- Read-only access for all UI components

## Dependencies

- Prisma migration system
- Existing admin authentication/authorization
- Current UI component structure
- Tailwind CSS for styling

## Success Criteria

1. Sold status is visually clear in all relevant views
2. Public catalog shows sold indicators appropriately
3. Filtering works correctly for sold/unsold items
4. No performance degradation on existing queries
5. Mobile-responsive design maintained
6. Database updates for sold status can be made directly when needed

## Future Enhancements (Not in Scope)

- Sale date tracking
- Sale price vs listed price comparison
- Buyer information tracking
- Sales analytics dashboard
- Automated status updates from payment systems
