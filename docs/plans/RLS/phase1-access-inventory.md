# Phase 1 Access Inventory (RLS Preparation)

## Purpose

This document completes **Phase 1 / Step 1.1** from the RLS migration plan by inventorying current database access paths and classifying each path into one of:

1. **Artist-scoped application access**
2. **Privileged admin/super-admin bypass access**
3. **System/operational access**

---

## Classification Rules Used

- **Artist-scoped**: user acts on their own artist-linked data (or super-admin acting via `proxyEmail` as an explicit target artist workflow).
- **Privileged bypass**: cross-artist admin operations, admin overviews, moderation, allocation, or management flows.
- **System/operational**: logging, data migration scripts, seeding/import scripts, validation scripts, repair scripts.

---

## A) Shared Repository Layer

Primary shared access layer: `src/lib/components/server/registrationDB.ts`

### Artist-scoped repository functions

- `getSubmission`
- `getEntries`
- `createNewRegistration`
- `createArtist`
- `entryCreate`
- `getEntry`
- `getImage`
- `getEntryImages`
- `createImage`
- `deleteEntryById`
- `getEntryImagesWithPrimary`
- `setPrimaryImage`
- `deleteImage`
- `createPrimaryImageRelation`
- `updatePrimaryImageRelation`
- `updateArtist`
- `updateEntry`
- `updateRegistration`

### Privileged repository functions

- `upsertEntryLocation`
- `markEntriesSold`
- `getExhibits`

### Mixed risk note

Some artist-scoped workflows currently call repository functions that internally use the global Prisma client while route code opens a transaction (`prisma.$transaction`). This is a Phase 3 refactor target so transaction context is explicit end-to-end.

---

## B) Route-Level Access Inventory

## Artist-scoped application access

- `src/routes/+layout.server.ts` (loads submission/form bootstrap)
- `src/routes/(app)/register/+layout.server.ts` (load submission + route guard behavior)
- `src/routes/(app)/view/+page.server.ts`
- `src/routes/(app)/register/artist/+page.server.ts`
- `src/routes/(app)/register/entry/+page.server.ts`
- `src/routes/(app)/register/confirm/+page.server.ts`
- `src/routes/api/image-upload/+server.ts`
- `src/routes/api/entry-images/+server.ts` _(currently accepts entry id without explicit actor ownership check in handler; ownership must be guaranteed by access layer/RLS)_
- `src/routes/api/registerComplete/+server.ts`

## Privileged admin/super-admin bypass access

- `src/routes/(app)/admin/+page.server.ts` (exhibits listing + super-admin proxy email set)
- `src/routes/(app)/admin/accept/+page.server.ts`
- `src/routes/(app)/admin/list/+page.server.ts`
- `src/routes/(app)/admin/locationUpdate/+page.server.ts`
- `src/routes/(app)/admin/sales/+page.server.ts`
- `src/routes/(app)/admin/errorLog/+page.server.ts`
- `src/routes/api/updateAccepted/+server.ts` (admin only)
- `src/routes/api/toggleOpenClosed/+server.ts` (super-admin only)
- `src/routes/api/getExhibits/+server.ts` (admin-sensitive behavior for current year)

## System/operational access

- `src/lib/server/logger.ts` (writes `logTable`)

---

## C) Scripts Inventory

## System/operational scripts (root `scripts/`)

- `scripts/data-migration-primary-images.ts`
- `scripts/validate-primary-images.ts`

## System/operational scripts (`src/scripts/`)

- `src/scripts/data-migration-check.ts`
- `src/scripts/reassignEntry.ts`
- `src/scripts/seed.ts`
- `src/scripts/set-sold-indicators.ts`
- `src/scripts/2023Upload.ts`
- `src/scripts/2024Upload.ts`
- `src/scripts/getAccepted.ts`
- `src/scripts/test-logger.ts`
- `src/scripts/test-payment-error.ts` _(integration test path; no direct Prisma writes)_
- `src/scripts/playground.ts` _(data analysis utility; no DB writes)_

---

## D) Direct Prisma Usage Outside Repository (Important for Phase 3)

Direct Prisma usage exists in:

- `src/routes/(app)/register/entry/+page.server.ts`
  - opens transaction + performs direct image updates
- `src/routes/(app)/register/confirm/+page.server.ts`
  - opens transaction + direct artist lookup
- `src/routes/(app)/admin/errorLog/+page.server.ts`
  - direct log queries for admin page
- `src/lib/server/logger.ts`
  - direct log writes
- multiple scripts in `scripts/` and `src/scripts/`

These are expected but should be made explicit as either:

- artist-scoped repositories,
- privileged repositories, or
- operational/system clients.

---

## E) Phase 1 Step 1.1 Completion

Status: **Completed**

Artifacts produced:

- Access inventory (this file)
- Ownership matrix: `docs/plans/RLS/phase1-ownership-matrix.md`
- Integrity baseline: `docs/plans/RLS/phase1-integrity-baseline.md`
- Rollout gates: `docs/plans/RLS/phase1-rollout-gates.md`
