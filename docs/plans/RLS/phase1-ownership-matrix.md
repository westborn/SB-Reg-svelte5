# Phase 1 Ownership Matrix (RLS Design Baseline)

## Purpose

This document completes **Phase 1 / Step 1.2** by defining row ownership boundaries and intended CRUD actors for each in-scope table.

Actors:

- **Artist-scoped user**: normal signed-in artist context
- **Privileged admin/super-admin**: explicit bypass path (including proxy workflows)
- **System/operational**: logger, migrations, scripts, maintenance

---

## Table: `artist`

Ownership key:

- Row owner is the artist account (`artist.email` mapped from authenticated user/proxy target).

Access intent:

- Read: owner ✅, privileged ✅, system ✅
- Insert: owner ✅ (artist create flow), privileged ✅, system ✅
- Update: owner ✅, privileged ✅, system ✅
- Delete: privileged/system only (normally no self-delete in app)

RLS policy intent:

- Artist can only see/update their own `artist.id` row.
- Privileged/system bypass path handles cross-artist access.

---

## Table: `registration`

Ownership key:

- Owned by `artist_id`.

Access intent:

- Read: owner ✅, privileged ✅, system ✅
- Insert: owner ✅ (first entry triggers registration create), privileged ✅, system ✅
- Update: owner ✅ (confirm/complete flows), privileged ✅, system ✅
- Delete: privileged/system only (rare, usually cascade)

RLS policy intent:

- Artist can access registrations where `registration.artist_id` maps to owned artist.

---

## Table: `entry`

Ownership key:

- Owned by `artist_id` and linked to registration chain.

Access intent:

- Read: owner ✅, privileged ✅, system ✅
- Insert: owner ✅, privileged ✅, system ✅
- Update: owner ✅ (title/details/images/sold state for admin paths), privileged ✅, system ✅
- Delete: owner ✅ (entry delete), privileged ✅, system ✅

RLS policy intent:

- Artist may access rows where `entry.artist_id` maps to owned artist.
- Keep admin acceptance/sales as privileged bypass.

---

## Table: `image`

Ownership key:

- Owned by `artist_id`, optionally attached to `registration_id`/`entry_id`.

Access intent:

- Read: owner ✅, privileged ✅, system ✅
- Insert: owner ✅ (upload), privileged ✅, system ✅
- Update: owner ✅ (attach image to entry during create/update), privileged ✅, system ✅
- Delete: owner ✅ (via entry image delete flow), privileged ✅, system ✅

RLS policy intent:

- Artist may access images where `image.artist_id` maps to owned artist.
- Attachment updates must preserve registration/entry ownership chain.

---

## Table: `primary_image`

Ownership key:

- Derived ownership via `entry_id` (and therefore entry artist).

Access intent:

- Read: owner ✅, privileged ✅, system ✅
- Insert: owner ✅ (set primary on create/update), privileged ✅, system ✅
- Update: owner ✅ (change primary), privileged ✅, system ✅
- Delete: typically cascade/system; owner path should not orphan entry/image integrity

RLS policy intent:

- Access allowed only when referenced `entry_id` belongs to owned artist.
- Integrity condition: `primary_image.image_id` must reference an image attached to the same entry.

---

## Table: `location`

Ownership key:

- Derived from `entry_id`.

Access intent:

- Read: owner (view-only by ownership context) ✅, privileged ✅, system ✅
- Insert: privileged/system only (admin placement workflows)
- Update: privileged/system only
- Delete: privileged/system only (or cascade)

RLS policy intent:

- Artists may read location for their own entries.
- Writes remain privileged only.

---

## Table: `log`

Ownership key:

- System-owned operational telemetry.

Access intent:

- Read: privileged/system only
- Insert: system (logger) and privileged app paths
- Update/Delete: system maintenance only (not normal app paths)

RLS policy intent:

- No artist-scoped read access.
- Keep logger writes in privileged/system bypass path.

---

## Cross-Table Invariants to Preserve

- `registration.artist_id` references a valid artist
- `entry.registration_id` and `entry.artist_id` remain ownership-consistent
- `image` attachment chain remains consistent with `artist/registration/entry`
- `primary_image.entry_id` unique
- `primary_image.image_id` must belong to same entry
- `location.entry_id` unique
- cascade delete behavior must remain complete and non-partial

---

## Phase 1 Step 1.2 Completion

Status: **Completed**
