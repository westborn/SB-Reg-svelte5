# Plan: Update Database Access to Row Level Security (RLS)

This plan upgrades application data access to use PostgreSQL Row Level Security (RLS) while preserving the current authentication flow, keeping Prisma as the primary data access layer, and retaining super-admin proxy mode as a privileged bypass. The primary success criterion is **data integrity**: artist ownership boundaries must tighten without breaking cascade deletes, one-to-one relationships, admin workflows, or existing production data.

The safest implementation path is to first prove the design against a **full cloud-based copy of the existing production database**. A cloud clone is preferred over a local copy because it better preserves production-like database behavior, access controls, backup/restore workflows, and operational safety for a full real-world dataset.

## Scope

### In Scope

- Add RLS to application data tables used by registration, entries, images, locations, and related artist-owned records
- Keep Prisma in place and adapt the data access layer to work cleanly with both RLS-scoped and privileged paths
- Preserve super-admin proxy behavior as a privileged bypass, not as a widened end-user policy
- Validate the design using a full cloud-based database copy before any production change
- Treat data integrity validation as a release gate at each phase

### Out of Scope

- Reworking Supabase Auth, login, token, or session issuance flows
- Replacing Prisma with Supabase data access for general application usage
- Re-architecting admin authorization beyond what is required to preserve current bypass behavior
- Large UI redesigns unrelated to RLS readiness

## Executive Summary

The current application already keeps most business logic on the server and uses Prisma directly, which is a strong foundation. However, RLS will only be safe if we first make the server data-access layer more explicit about which paths are:

1. **Normal artist-scoped application access**
2. **Privileged admin/super-admin bypass access**
3. **Operational/system access** such as logging, scripts, and migrations

That separation is necessary because the current codebase mixes helper-based Prisma access with direct Prisma calls in route files. Before enabling RLS, the application should make those boundaries intentional so production behavior remains predictable.

## Why Cloud-Based Full Copy Is the Safer Option

### Recommended Approach

Use a **cloud-hosted full copy of the current database** as the primary development and test environment for the RLS migration.

### Why This Is Safer Than Local

- **Closer to production behavior**: RLS behavior, roles, connection patterns, and operational characteristics are more faithfully represented
- **Safer handling of real data**: a full production-like dataset is better isolated in managed infrastructure than on a developer laptop
- **Better rollback and snapshot workflows**: cloud environments usually support snapshots, restore points, and controlled reset procedures
- **More realistic multi-user testing**: admin, artist, and super-admin workflows can be tested with fewer local-environment distortions
- **Lower chance of accidental leakage**: local full copies are easier to mishandle, duplicate, or leave unencrypted

### Safety Requirements for the Cloud Clone

- Restrict access to a minimal set of maintainers
- Snapshot before every major RLS policy change
- Use separate credentials from production
- Disable any accidental outbound integrations that should not run in staging
- Clearly label the environment as a non-production RLS proving ground
- Confirm backup and restore steps before the first migration is applied

## Current State Analysis

### Current Access Model

The application currently uses server-side Prisma access for business operations, primarily through [src/lib/components/server/registrationDB.ts](src/lib/components/server/registrationDB.ts). Effective user identity is resolved in [src/hooks.server.ts](src/hooks.server.ts), where:

- normal users act as themselves
- admins are identified by email domain
- super-admins can proxy another artist through `proxyEmail`

This means the app already has a clear concept of **effective artist identity**, which is useful for RLS design. However, the app does **not yet** have a clean separation between:

- data access that should be constrained by artist ownership
- data access that must remain privileged

### Current Database Integrity Model

The schema in [prisma/schema.prisma](prisma/schema.prisma) relies heavily on relational integrity and cascade deletes:

- `artistTable` → `registrationTable` → `entryTable`
- `imageTable` links to artist, registration, and entry
- `primaryImageTable` tracks one primary image per entry
- `locationTable` is one-to-one with entry
- `logTable` supports database-backed logging

This is important because RLS must not accidentally block legitimate relational operations, especially:

- cascade deletes
- multi-step writes inside transactions
- primary image reassignment
- admin maintenance operations
- logging and diagnostics during failures

### Current Risk Areas for RLS Adoption

- Some route handlers use helper functions while others still use direct Prisma access
- Admin and super-admin workflows are privilege-sensitive and must not be forced through end-user RLS rules
- `primaryImageTable` integrity depends not only on foreign keys, but also on ownership semantics between entry and image
- Existing scripts and migrations may fail under RLS unless explicitly routed through privileged/system access
- If RLS is enabled too early, production behavior could break in subtle ways even when schema integrity remains intact

## Success Criteria

The RLS migration is complete only when all of the following are true:

- normal artists can only read and modify their own current and historical records as intended
- super-admin proxy mode still works through an intentional privileged bypass path
- admin operational workflows remain functional
- cascade deletes still remove dependent data safely and completely
- `primary_image` ownership remains valid for every entry that has images
- existing register, view, and admin flows behave the same from a user perspective
- Prisma remains the application’s primary database API
- auth flows remain unchanged
- production rollout can be reversed quickly without data loss

## Phase Overview

### Phase 1: Discovery, Access Classification, and Safety Baseline

**Goal**: identify every database access pattern, classify it correctly, and baseline integrity before any schema or policy change.

**Why first**: RLS should not be designed table-first; it should be designed around real application access patterns and failure modes.

#### Step 1.1 Inventory all Prisma access paths

Review:

- [src/lib/components/server/registrationDB.ts](src/lib/components/server/registrationDB.ts)
- register route server files under [src/routes/(app)/register](<src/routes/(app)/register>)
- admin route server files under [src/routes/(app)/admin](<src/routes/(app)/admin>)
- [src/lib/server/logger.ts](src/lib/server/logger.ts)
- scripts under [scripts](scripts) and [src/scripts](src/scripts)

Classify each query or command into one of these buckets:

- **Artist-scoped application access**
- **Privileged admin or super-admin bypass access**
- **System/operational access**

#### Step 1.2 Map ownership boundaries by table

For each table, document:

- who should be allowed to read it
- who should be allowed to insert into it
- who should be allowed to update it
- who should be allowed to delete from it
- whether access is row-owned by artist, entry, or system role

Start with:

- `artist`
- `registration`
- `entry`
- `image`
- `primary_image`
- `location`
- `log`

#### Step 1.3 Establish baseline integrity checks

Before any RLS work begins, create a repeatable checklist that validates:

- every registration belongs to a valid artist
- every entry belongs to a valid registration and artist
- every image belongs to a valid artist and, when attached, to the correct registration/entry chain
- every `primary_image.entry_id` is unique
- every `primary_image.image_id` belongs to an image attached to the same entry
- every `location.entry_id` is unique
- no orphaned records exist across cascade chains

#### Step 1.4 Define rollout gates

Define explicit gates for moving between phases:

- access classification complete
- cloud clone provisioned and verified
- integrity baseline captured
- privileged bypass design approved
- rollback tested at least once on the clone

**Outcome of Phase 1**

- complete access inventory
- agreed ownership model
- repeatable integrity checklist
- clear release gates

---

### Phase 2: Cloud Clone Provisioning and Proof Environment Setup

**Goal**: create a safe, production-like proving ground for all RLS design, migration, and validation work.

#### Step 2.1 Create full cloud database copy

Provision a full copy of the current production database in a cloud environment that is isolated from production.

Requirements:

- same PostgreSQL major version as production
- same schema and extensions as production
- full dataset copied intact
- no production app traffic
- tightly controlled credentials

#### Step 2.2 Sanitize operational integrations where required

Review non-database integrations that should not run against the clone, including:

- outbound email
- background or API-triggered automations
- any destructive scripts

The goal is to keep the clone realistic for data access while preventing accidental real-world side effects.

#### Step 2.3 Validate clone fidelity

On the clone, verify:

- schema matches production
- row counts match expected baseline
- Prisma can connect and operate normally
- migrations can be rehearsed safely
- backups and restoration are confirmed

#### Step 2.4 Snapshot strategy

Create an operational rule that every RLS iteration on the clone starts from either:

- a fresh restorable snapshot, or
- a known clean baseline snapshot

This makes testing repeatable and protects data integrity analysis from drift.

**Outcome of Phase 2**

- safe cloud-based full-copy environment
- repeatable restore workflow
- production-like data for realistic testing

---

### Phase 3: Access Layer Refactor for Prisma + RLS Compatibility

**Goal**: make the application explicit about which Prisma access paths are RLS-scoped versus privileged.

**Why this matters**: if the application keeps mixing normal-user access and bypass access arbitrarily, RLS behavior will be hard to reason about and harder to test.

#### Step 3.1 Split repository responsibilities

Refactor data access around two intentional categories:

- **Artist-scoped repositories** for normal application reads/writes
- **Privileged repositories** for admin, super-admin bypass, logging, and operational work

This does **not** mean creating duplicate business logic everywhere. It means making the access context explicit so the same business rules can be executed under the correct privilege model.

#### Step 3.2 Preserve super-admin proxy as bypass

The current super-admin model in [src/hooks.server.ts](src/hooks.server.ts) should remain functionally the same:

- super-admin is identified through current logic
- `proxyEmail` still selects the target artist
- proxy mode remains a privileged bypass path
- proxy behavior is **not** implemented by broadening normal-user RLS policies

That avoids making ordinary artist policies more permissive than necessary.

#### Step 3.3 Remove ambiguous route-level access patterns

Where route files mix direct Prisma calls and helper-layer calls, refactor toward clearer boundaries.

Target outcomes:

- route files depend on repository functions with intentional access mode
- direct Prisma access is minimized in route handlers
- transaction boundaries remain explicit and testable

#### Step 3.4 Ensure transaction-friendly design

Any critical multi-step mutation should be able to run under a consistent Prisma client/transaction context.

Examples include:

- entry creation with images
- entry update with image changes
- primary image reassignment
- deletion flows with related cleanup
- admin maintenance updates

#### Step 3.5 Protect system access paths

Keep the following outside normal user-scoped RLS behavior where appropriate:

- logging through [src/lib/server/logger.ts](src/lib/server/logger.ts)
- migration scripts
- validation scripts
- admin-wide data listings
- operational repairs and backfills

**Outcome of Phase 3**

- access paths are explicit
- Prisma remains the main data layer
- super-admin bypass is preserved intentionally
- the app is structurally ready for RLS

---

### Phase 4: RLS Policy Design for Application Data Tables

**Goal**: design the minimum policy set needed to enforce row ownership for normal users without breaking privileged flows.

#### Step 4.1 Apply RLS only to application data scope

RLS rollout should focus on application data tables, not auth/session infrastructure.

Primary targets:

- artist
- registration
- entry
- image
- primary_image
- location

Non-goal for this phase:

- changing auth tables or token/session behavior

#### Step 4.2 Define artist-owned row semantics

Normal user policies should be based on effective artist identity.

Expected model:

- artists may read and modify only their own rows
- child tables derive access through their owning artist relationship
- updates and deletes should respect ownership through joins or ownership columns

#### Step 4.3 Keep privileged operations separate

Privileged/admin behavior should continue through a bypass channel rather than expanding end-user policy rules.

This includes:

- super-admin proxy actions
- cross-artist admin views
- location updates
- sales/admin workflows
- integrity repair operations
- logs and diagnostics

#### Step 4.4 Add policies incrementally, not all at once

Recommended order:

1. read policies for artist-owned tables
2. insert/update policies for lowest-risk tables
3. child-table write policies
4. delete policies only after ownership and cascade behavior are fully validated

This reduces blast radius and simplifies diagnosis.

#### Step 4.5 Document policy intent in plain language

For each policy, record:

- target table
- actor
- allowed operation
- ownership rule
- dependencies on related tables
- failure mode if the policy is misconfigured

This documentation is essential for future maintenance and audits.

**Outcome of Phase 4**

- minimal and understandable RLS policy model
- normal-user ownership enforcement
- admin and system access preserved through bypass design

---

### Phase 5: Integrity-First Validation on the Cloud Clone

**Goal**: prove that RLS strengthens row access controls without damaging data integrity or application behavior.

This phase is the core of the project. RLS should not move to production until validation passes repeatedly on the full cloud copy.

#### Step 5.1 Functional workflow validation

Run end-to-end tests for:

- artist registration creation
- artist updates
- entry creation
- entry update
- image upload and attachment
- primary image selection and reassignment
- entry deletion
- admin location updates
- admin sales/acceptance workflows
- read-only views and summaries

#### Step 5.2 Negative security validation

Prove that normal artists cannot:

- read another artist’s records
- update another artist’s records
- delete another artist’s records
- manipulate related child rows that they do not own
- exploit joins to infer unauthorized data

#### Step 5.3 Data integrity validation

Re-run and expand the baseline checks from Phase 1 after every policy increment.

Required integrity checks:

- all foreign key chains still resolve correctly
- no blocked cascade deletes leave partial data behind
- `primary_image` rows remain one-per-entry
- `primary_image.image_id` always belongs to the matching entry
- location rows remain one-per-entry
- log writes still succeed when expected
- admin maintenance operations do not corrupt ownership links

#### Step 5.4 Script and migration validation

Validate all important scripts against the intended access model, including:

- [scripts/data-migration-primary-images.ts](scripts/data-migration-primary-images.ts)
- validation scripts in [scripts](scripts)
- useful repair or admin scripts in [src/scripts](src/scripts)

These should either:

- run through privileged/system access, or
- be explicitly documented as incompatible with user-scoped RLS execution

#### Step 5.5 Performance and operational validation

Check for regressions in:

- common registration flows
- admin listing queries
- image-related operations
- logging and diagnostics under error conditions

RLS that is correct but operationally fragile is not ready.

#### Step 5.6 Repeatability requirement

Validation must pass more than once from a clean clone baseline. One successful run is not enough.

**Outcome of Phase 5**

- verified functional parity
- verified denial of unauthorized access
- verified data integrity under realistic data volume
- confidence that the design is production-safe

---

### Phase 6: Production Rollout and Rollback Readiness

**Goal**: introduce RLS into production in small, reversible steps with monitoring and clear rollback options.

#### Step 6.1 Deploy access-layer refactor first

Ship the Prisma access-layer separation before turning on RLS. This isolates application-structure risk from policy risk.

#### Step 6.2 Apply RLS in controlled increments

Enable RLS table-by-table rather than via a single large release.

Suggested order:

1. least-coupled read paths
2. straightforward artist-owned writes
3. child-table writes
4. delete-sensitive tables only after prior phases are stable

#### Step 6.3 Add rollout monitoring

Use application logging and targeted admin checks to watch for:

- authorization failures
- unexpected empty query results
- write failures
- rollback-worthy admin flow failures
- integrity drift after mutations

#### Step 6.4 Define rollback strategy before cutover

Rollback options should be written, tested, and approved before production enablement.

At minimum, document how to:

- disable or relax newly added policies safely
- restore from pre-change snapshot if required
- confirm post-rollback integrity
- determine whether rollback is app-only, DB-only, or both

#### Step 6.5 Post-cutover verification window

After rollout, run a short but explicit verification window covering:

- artist self-service flows
- super-admin proxy flows
- admin operational flows
- log visibility
- core integrity checks

**Outcome of Phase 6**

- low-blast-radius production release
- known rollback path
- monitored stabilization period

---

## Detailed Integrity Checklist

This checklist should be treated as a hard release gate.

### Ownership Integrity

- every artist can access only their own rows through normal application paths
- no artist can access another artist’s registration, entry, image, or location rows
- admin bypass paths continue to work intentionally
- super-admin proxy affects only the selected target artist data

### Relational Integrity

- every registration references a valid artist
- every entry references a valid artist and registration
- every image references a valid artist and, if attached, the correct registration/entry
- every location references exactly one valid entry
- every primary image references exactly one valid entry and a valid image

### Primary Image Integrity

- there is no entry with multiple primary image rows
- every entry with images has exactly one valid primary image after save operations
- deleting or replacing images never leaves an invalid primary image relationship
- primary image ownership always matches the same entry as the referenced image

### Cascade Delete Integrity

- deleting an artist removes registrations, entries, images, locations, and primary image rows as expected
- deleting a registration behaves consistently with child records
- deleting an entry does not strand images, location rows, or primary image rows
- RLS does not block legitimate cascades or produce partial cleanup

### Operational Integrity

- logging still works during success and failure cases
- migration and repair scripts operate only through intended privileged/system paths
- admin-wide queries still return expected datasets
- no silent failures are introduced by policy denial

## Risks and Mitigations

### Risk 1: Prisma access remains too mixed to reason about

**Mitigation**: complete Phase 3 before enabling RLS anywhere.

### Risk 2: Policies are technically correct but block legitimate cascades or child writes

**Mitigation**: validate delete and multi-step mutation behavior repeatedly on the full cloud copy.

### Risk 3: Super-admin proxy behavior leaks into normal-user policies

**Mitigation**: keep proxy mode as privileged bypass, not as an exception inside artist-scoped policies.

### Risk 4: Scripts and repairs fail unexpectedly once RLS is active

**Mitigation**: classify every script and move operational tasks onto privileged/system access paths.

### Risk 5: Full-copy test environment drifts from production reality

**Mitigation**: use fresh snapshots, validate schema parity, and document clone refresh timing.

### Risk 6: Rollback is unclear under pressure

**Mitigation**: write and rehearse rollback before production enablement.

## Deliverables

By the end of this plan, the project should have:

- a documented access inventory
- a cloud-based full-copy RLS proving environment
- a refactored Prisma access layer with explicit privileged bypass paths
- documented RLS policies for application data tables
- repeatable integrity validation scripts/checklists
- a phased production rollout sequence
- a tested rollback procedure

## Recommended Order of Work

1. Inventory and classify access paths
2. Provision and verify the cloud clone
3. Baseline integrity and snapshot workflows
4. Refactor Prisma access boundaries
5. Design artist-scoped RLS policies
6. Validate incrementally on the clone
7. Rehearse rollback
8. Roll out to production in controlled phases

## Refinement Questions for Review

These are the main items to refine together before implementation work begins:

1. Which existing route handlers should be converted first to make the access split easiest to reason about?
2. Do we want to document the RLS policies in this file only, or also add a dedicated technical policy matrix under `docs/guides`?
3. Which integrity checks should become automated scripts versus manual release-check items?
4. Should production rollout start with read-only policy enforcement on selected tables before enabling full write protection?
5. Do we want a dedicated staging application deployment pointed at the cloud clone for realistic UI-level rehearsal?

## Final Recommendation

Proceed only if the team agrees on this sequence:

- **cloud full-copy first**
- **Prisma access-layer separation before RLS**
- **super-admin bypass preserved explicitly**
- **auth flows untouched**
- **data integrity treated as the main release gate**

That sequence provides the safest path to stronger row security without destabilizing a working registration system.

---

## Phase 1 Implementation Status

Phase 1 deliverables have been documented in the following files:

- Access inventory: [phase1-access-inventory.md](phase1-access-inventory.md)
- Ownership matrix: [phase1-ownership-matrix.md](phase1-ownership-matrix.md)
- Integrity baseline checklist: [phase1-integrity-baseline.md](phase1-integrity-baseline.md)
- Integrity SQL checks: [phase1-integrity-checks.sql](phase1-integrity-checks.sql)
- Rollout gates: [phase1-rollout-gates.md](phase1-rollout-gates.md)

Phase 1 exit status: **ready to proceed to Phase 2 (cloud clone provisioning and fidelity validation).**
