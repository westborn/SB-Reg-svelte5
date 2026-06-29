# Phase 1 Integrity Baseline and Validation Checklist

## Purpose

This document completes **Phase 1 / Step 1.3** by defining a repeatable, integrity-first baseline before any RLS policy rollout.

Use this checklist:

- before first RLS migration on a clone,
- after each policy increment,
- before any production cutover.

Related SQL: `docs/plans/RLS/phase1-integrity-checks.sql`

---

## Baseline Inputs

Capture the following and keep them with each run:

- timestamp
- target environment name
- DB snapshot/restore point id
- git revision used for validation scripts
- validator initials

---

## Required Checks

## 1) Registration ownership integrity

Pass when:

- no `registration` row exists without a valid parent `artist` row.

## 2) Entry chain integrity

Pass when:

- no `entry` row exists without valid `artist` and `registration` rows,
- and `entry.artist_id = registration.artist_id` for every entry.

## 3) Image chain integrity

Pass when:

- no `image` row exists without valid artist,
- attached images (`entry_id` not null) have valid `entry` and matching artist,
- attached images with `registration_id` have registration ownership consistent with entry and artist.

## 4) Primary image structural integrity

Pass when:

- `primary_image.entry_id` uniqueness is preserved,
- every `primary_image.image_id` points to an existing image,
- every primary image points to an image attached to the same entry.

## 5) Location one-to-one integrity

Pass when:

- no duplicate `location.entry_id` values,
- every location row references an existing entry.

## 6) Orphan scan across cascade chains

Pass when:

- no orphan child rows are found across registration/entry/image/location/primary_image.

## 7) Existing script-backed checks

Pass when:

- `scripts/validate-primary-images.ts` reports success,
- `scripts/data-migration-primary-images.ts --execute` is not needed (or if run, leaves all checks passing),
- any maintenance scripts intended for the environment complete under expected privilege mode.

---

## Operational Rule

Any failed check blocks progression to the next RLS phase.

No exceptions without:

1. documented issue record,
2. approved mitigation,
3. successful re-run from a clean baseline.

---

## Evidence Template

For each validation run, store:

- SQL output summary (pass/fail counts)
- script output logs
- notes on anomalies
- remediation actions taken
- re-validation result

---

## Phase 1 Step 1.3 Completion

Status: **Completed**
