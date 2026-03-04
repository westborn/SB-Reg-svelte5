# Features

| ID  | Feature Description        | Details                                                                                                                     | Done |
| --- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---- |
| 001 | Change Label               | For the Exhibition Confirmation form, change the label to "Any special requirement e.g. does your artwork need a flat area" | ✅   |
| 002 | multipleImages - Plan      | Write a plan to implement multiple image processing details of the request are in @docs/plans/multipleImages.md             | ✅   |
| 003 | multipleImages - Phase 1   | Database schema changes and migration for primary images support                                                            | ✅   |
| 004 | multipleImages - Phase 2   | Backend API changes for multiple images support                                                                             | ✅   |
| 005 | multipleImages - Phase 3   | State management updates for multiple images                                                                                | ✅   |
| 006 | multipleImages - Phase 4   | Core UI components for image management                                                                                     | ✅   |
| 007 | multipleImages - Phase 5   | Integration with entry forms                                                                                                | ✅   |
| 008 | multipleImages - Phase 6.1 | Database migration script creation and execution                                                                            | ✅   |
| 009 | multipleImages - Phase 6.2 | Data migration: Create primary image records for all existing entries with images                                           | ✅   |
| 010 | addSoldIndicator - Plan    | Write a plan to implement sold indicator functionality, details in @docs/plans/addSoldIndicator.md                          | ✅   |
| 011 | addSoldIndicator - Phase 1 | Database schema updates: Add sold boolean field to entryTable and create migration                                          | ✅   |
| 012 | addSoldIndicator - Phase 2 | Backend API updates: Update queries and schemas (read-only, no admin update endpoints)                                      | ✅   |
| 013 | addSoldIndicator - Phase 3 | Public display updates: Update catalogue and entry cards with sold indicators and filtering                                 | ✅   |
| 014 | salesUpdate - Plan         | Write a plan to implement admin sales sold-sync workflow, details in @docs/plans/sales.md                                   | ✅   |
| 015 | salesUpdate - Phase 1      | Route contract and skeleton for /admin/sales (no DB writes)                                                                 | ✅   |
| 016 | salesUpdate - Phase 2      | Square read integration with date range filters and logging                                                                 | ✅   |
| 017 | salesUpdate - Phase 3      | SKU parsing and classification (including ignoring SKU "Not Art")                                                           | ✅   |
| 018 | salesUpdate - Phase 4      | Entry matching preview using SKU fields: exhibitNumber + artistName + entryId                                               | ✅   |
| 019 | salesUpdate - Phase 5      | Controlled sold updates: set selected matched entries to sold=true                                                          | ✅   |
| 020 | salesUpdate - Phase 6      | UX polish and admin navigation integration                                                                                  | ✅   |
| 021 | refactorOrUpgrade - Plan   | Create and finalize plan in @docs/plans/refactorOrUpgrade.md                                                                | ✅   |
| 022 | refactorOrUpgrade - Wave 0 | Preflight & baseline capture. Manual integrity test required. Must be committed before Wave 1.                              | ✅   |
| 023 | refactorOrUpgrade - Wave 1 | Refactor hardening (forms/auth/db/payment + package hygiene pre-work). Manual integrity test required. Commit gate.         | ✅   |
| 024 | refactorOrUpgrade - Wave 2 | Low-risk upgrades (tooling/non-critical libs). Manual integrity test required. Commit gate.                                 | ⬜   |
| 025 | refactorOrUpgrade - Wave 3 | Core runtime upgrades (Vite/Svelte/SvelteKit/Superforms/Supabase + shadcn ecosystem validation). Test + commit gate.        | ⬜   |
| 026 | refactorOrUpgrade - Wave 4 | Prisma upgrade and migration checkpoint (same cycle). Manual integrity test required. Commit gate.                          | ⬜   |
| 027 | refactorOrUpgrade - Wave 5 | Final stabilization, release prep, and post-release checklist setup. Manual integrity test required. Commit gate.           | ⬜   |

## Tracking Rules for refactorOrUpgrade

- Each wave is implemented with AI agents, then manually tested for integrity.
- A wave is only marked complete (`✅`) after manual test pass.
- Each completed wave must be its own git commit before the next wave starts.
