# Multiple Images Implementation Plan

## Overview

Implement functionality to allow unlimited images per entry in the database, with UI initially limited to 3 images. One image is designated as the "primary_image" via a separate relationship table. Users must upload at least 1 image and can replace/remove images (except when only one remains).

## Current System Analysis

### Database Schema Changes Required

- **ImageTable**: Already supports multiple images per entry via `entryId` foreign key
- **New PrimaryImageTable**: Separate table to track which image is primary for each entry
- **Relationship**: `entryTable.images[]` (unlimited) + `entryTable.primaryImage` (one-to-one)

### Current Image Flow

1. Images uploaded to "UnAttachedImages" folder in Cloudinary
2. Image stored in database with `artistId`, no `entryId`/`registrationId` initially
3. When entry created/updated, image gets linked via `entryId` and `registrationId`
4. Old image replaced by deleting from database and unlinking

## Implementation Plan

### Phase 1: Database Schema Updates

#### 1.1 Create Primary Image Table

Add new table to track primary image relationship:

```sql
CREATE TABLE primary_image (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER NOT NULL UNIQUE REFERENCES entry(id) ON DELETE CASCADE,
  image_id INTEGER NOT NULL REFERENCES image(id) ON DELETE CASCADE,
  created_at TIMESTAMP(6) DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.2 Update Prisma Schema

Add to `prisma/schema.prisma`:

```prisma
model primaryImageTable {
  id        Int        @id @default(autoincrement())
  entryId   Int        @unique @map("entry_id")
  imageId   Int        @map("image_id")
  createdAt DateTime   @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt DateTime   @updatedAt @map("updated_at")
  entry     entryTable @relation(fields: [entryId], references: [id], onDelete: Cascade)
  image     imageTable @relation(fields: [imageId], references: [id], onDelete: Cascade)

  @@map("primary_image")
}
```

Update existing models:

```prisma
model entryTable {
  // ...existing fields...
  images       imageTable[]
  primaryImage primaryImageTable?
}

model imageTable {
  // ...existing fields...
  primaryImageRelation primaryImageTable[]
}
```

### Phase 2: Backend API Changes

#### 2.1 Update Zod Schemas (`src/lib/zod-schemas.ts`)

- Add `primaryImageTableSchema` for the new table
- Add validation schema for multiple image operations:

  ```typescript
  export const multipleImagesSchema = z.object({
  	images: z.array(imageSchemaUI).min(1).max(3), // UI limit of 3
  	primaryImageId: z.number().int() // ID of the primary image
  });

  export const primaryImageTableSchema = z.object({
  	id: z.number().int(),
  	entryId: z.number().int(),
  	imageId: z.number().int(),
  	createdAt: z.coerce.date(),
  	updatedAt: z.coerce.date()
  });
  ```

#### 2.2 Update Database Helper Functions (`src/lib/components/server/registrationDB.ts`)

- Modify `getSubmission()` to include primary image relationship
- Add `getEntryImagesWithPrimary()` function - returns images with primary flagged
- Add `setPrimaryImage()` function to update primary image relationship
- Add `deleteImage()` function with validation (prevent deleting last image or primary without replacement)
- Add `createPrimaryImageRelation()` function
- Add `updatePrimaryImageRelation()` function

#### 2.3 Update Server Actions (`src/routes/(app)/register/entry/+page.server.ts`)

- Modify `entryCreate` to handle multiple images and set primary image
- Modify `entryUpdate` to handle multiple images and primary image changes
- Add new action `setPrimaryImage` for changing primary image
- Add new action `imageDelete` for removing images
- Add validation to ensure at least 1 image remains
- Auto-reassign primary image if primary image is deleted

### Phase 3: Frontend State Management

#### 3.1 Update Context (`src/lib/context.svelte.ts`)

- Change `workingImage` to `workingImages: CurrentImage[]`
- Add `primaryImageId` to track which image is the primary image
- Add helper functions:
  - `addWorkingImage()`
  - `removeWorkingImage()`
  - `setPrimaryImage()`
  - `getImagesWithPrimary()` (primary flagged in array)

#### 3.2 Update Constants (`src/lib/constants.ts`)

- Add `MAX_IMAGES_UI_LIMIT = 3` (UI display limit)
- Add `MIN_IMAGES_PER_ENTRY = 1`
- Add `DEFAULT_PRIMARY_IMAGE_INDEX = 0`

### Phase 4: UI Components

#### 4.1 Create New Components

##### `multiple-image-upload-form.svelte`

- Replace single image upload dialog
- Grid layout showing current images (up to 3 slots in UI)
- Upload button for empty slots (disabled when 3 images reached)
- Image preview with overlay indicators:
  - "Primary" badge on primary image
  - "Replace" button on each image
  - "Remove" button (disabled if only 1 image)
  - "Set as Primary" button on non-primary images

##### `image-gallery.svelte`

- Display component for entry images
- Thumbnail grid with primary image highlighted
- Click to view full size
- Show only up to 3 images in UI (with "..." indicator if more exist)

##### `image-slot.svelte`

- Individual image slot component
- Handles empty state, loading state, image display
- Action buttons (remove, set as primary, replace)

#### 4.2 Update Existing Components

##### `entry-create-form.svelte`

- Replace `ImageUploadForm` with `MultipleImageUploadForm`
- Update validation to require at least 1 image
- Pass `workingImages` array instead of single `workingImage`

##### `entry-update-form.svelte`

- Replace single image handling with multiple images
- Load existing images into `workingImages` on form initialization
- Load primary image relationship
- Handle primary image selection

##### `catalogue-card.svelte`

- Update to always use primary image
- Add small indicator if entry has multiple images (2+ images icon)

### Phase 5: Image Management Logic

#### 5.1 Upload Flow

1. User clicks "Add Image" (if < 3 images in UI)
2. Image uploads to Cloudinary in "UnAttachedImages" folder
3. Image added to `workingImages` array
4. If first image, automatically set as primary
5. User can change primary image before saving entry

#### 5.2 Primary Image Management

- First uploaded image is automatically primary image
- User can change primary image by clicking "Set as Primary" on other images
- Primary image always displayed first in grids
- Primary image used in catalogue card displays
- Primary image relationship stored in separate table

#### 5.3 Remove Image Logic

- Can only remove if > 1 image exists
- If removing primary image, user must select new primary from remaining images
- Confirm dialog for image removal
- Image deleted from Cloudinary and database
- Primary image relationship updated if necessary

#### 5.4 Replace Image Logic

- Click "Replace" on existing image slot
- Upload new image to Cloudinary
- Replace image URL/ID in database
- Delete old image from Cloudinary
- Maintain primary image relationship if replacing primary image

### Phase 6: Database Migration

#### 6.1 Migration Script

Create Prisma migration:

```bash
npx prisma migrate dev --name add_primary_image_table
```

#### 6.2 Data Migration

For existing entries with images:

- Create primary_image records for all existing entries that have images
- Set first image (by creation date) as primary image
- Ensure data integrity

### Phase 7: Testing & Validation

#### 7.1 Validation Rules

- Minimum 1 image per entry
- UI limit of 3 images for upload/display (database allows unlimited)
- Each image < 5MB
- Primary image always exists and references valid image
- Cannot delete last remaining image
- Primary image relationship integrity maintained

#### 7.2 User Experience Testing

- Image upload flow (up to 3 in UI)
- Image replacement flow
- Image removal flow
- Primary image selection
- Form validation and error handling
- Database consistency after operations

## Technical Considerations

### Database Design Benefits

- **Scalability**: Unlimited images in database allows future UI enhancements
- **Flexibility**: Primary image can be changed without data migration
- **Integrity**: Separate primary image table ensures referential integrity
- **Performance**: Primary image lookup is fast with dedicated table

### Image Storage

- Continue using Cloudinary folder structure
- Consider adding "MultipleImages" folder tag
- Implement proper cleanup of orphaned images
- Batch operations for multiple image uploads

### Performance

- Lazy load non-primary images in galleries
- Optimize image sizes for thumbnails vs full display
- Consider WebP format for better compression
- Index primary_image table on entry_id for fast lookups

### Mobile Responsiveness

- Ensure image grid works on mobile (max 3 images)
- Touch-friendly image management controls
- Swipe gestures for image galleries

### Accessibility

- Alt text for all images
- Keyboard navigation for image management
- Screen reader announcements for primary image changes
- Clear visual indicators for primary image

### Data Migration Strategy

- Create primary_image records for existing entries
- Handle entries with no images gracefully
- Backup database before migration
- Validate data integrity post-migration

## Implementation Order

1. Database schema changes and migration
2. Backend API changes (schemas, database helpers, server actions)
3. State management updates
4. Core UI components (image slots, upload form)
5. Integration with entry forms
6. Testing and refinement
7. UI polish and mobile optimization

## Success Criteria

- ✅ Users can upload 1-3 images per entry (UI limit)
- ✅ Database supports unlimited images per entry
- ✅ One image designated as primary image via separate table
- ✅ Users can change primary image to any existing image
- ✅ Users can replace individual images
- ✅ Users can remove images (but not the last one)
- ✅ Primary image relationship maintained consistently
- ✅ All existing functionality remains intact
- ✅ Mobile-friendly interface
- ✅ Proper error handling and validation
- ✅ Data migration completed successfully

## Future Enhancements

With unlimited images in database:

- Increase UI limit beyond 3 images
- Image galleries with pagination
- Bulk image operations
- Image categories/tags
- Advanced image management features
