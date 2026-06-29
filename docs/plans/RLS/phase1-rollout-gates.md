# Phase 1 Rollout Gates (RLS Program)

## Purpose

This document completes **Phase 1 / Step 1.4** by defining hard gates required before moving from discovery into Phase 2+ implementation.

---

## Gate G1 — Access Classification Complete

Required evidence:

- Access inventory published
- Route-level access modes classified
- Script-level operational paths classified
- Direct Prisma hotspots identified for Phase 3 cleanup

Evidence artifact:

- `docs/plans/RLS/phase1-access-inventory.md`

Status: **PASS**

---

## Gate G2 — Ownership Model Agreed

Required evidence:

- CRUD actor matrix defined per in-scope table
- ownership keys and derived ownership documented
- privileged bypass explicitly separated from artist policies

Evidence artifact:

- `docs/plans/RLS/phase1-ownership-matrix.md`

Status: **PASS**

---

## Gate G3 — Integrity Baseline Captured

Required evidence:

- integrity checklist defined
- SQL check pack prepared
- existing migration/validation scripts identified for use

Evidence artifacts:

- `docs/plans/RLS/phase1-integrity-baseline.md`
- `docs/plans/RLS/phase1-integrity-checks.sql`

Status: **PASS**

---

## Gate G4 — Cloud Clone Provisioning Plan Ready

Required evidence:

- target cloud clone defined
- access control plan documented
- snapshot/restore process agreed
- operational integrations to disable/sanitize identified

Status: **PENDING** (to be completed in Phase 2)

---

## Gate G5 — Privileged Bypass Design Approved

Required evidence:

- super-admin proxy remains bypass, not widened artist policy
- admin operational flows mapped to privileged path
- logger/system operations mapped outside user-scoped RLS path

Status: **PASS (design-level)**

Notes:

- Technical implementation hardening occurs in Phase 3.

---

## Gate G6 — Rollback Rehearsal Completed on Clone

Required evidence:

- at least one tested rollback from policy change
- integrity baseline re-run post-rollback

Status: **PENDING** (Phase 2/6 activity)

---

## Phase 1 Exit Decision

Phase 1 is considered complete when G1, G2, and G3 are PASS and no blocking issues remain.

Current Phase 1 outcome: **READY TO PROCEED TO PHASE 2**
