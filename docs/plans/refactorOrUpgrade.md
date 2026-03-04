# Refactor vs Upgrade Plan (Decision Document)

**Project**: SB-Reg-svelte5  
**Date**: 2026-03-04  
**Status**: Finalized planning baseline (no implementation yet)

---

## 1) Inputs Received

From your latest answers:

- **Primary driver**: **C = Long-term maintainability**
- **Risk tolerance**: **A = Can freeze feature work**
- **Must-not-regress scope**: **A = Auth + Register flows only**

Final decision inputs (confirmed):

- Must-not-regress scope: **Auth only**
- Prisma timing: **In same cycle**
- Temporary non-critical UI regressions outside Auth: **Allowed**
- Release strategy: **One release**
- Targeting policy: **Latest stable**
- Package hygiene cleanup: **Included**

Given these inputs, the most suitable approach is:

## Recommended Sequence: **Refactor-first, then upgrade in waves**

Why:

1. Maintainability as top priority favors reducing coupling before dependency churn.
2. Feature freeze tolerance allows safe structural cleanup first.
3. Limited no-regression surface (Auth/Register) enables tighter validation gates and faster iteration.

> Note: scope is now narrowed further to **Auth only** for hard regression gating.

---

## 2) Decision Framework (Final Go/No-Go Rules)

Use this rule set before starting each wave:

### Gate A — Stability Baseline

- `pnpm lint` passes
- `pnpm check` passes
- `pnpm build` passes

### Gate B — Critical Path Smoke (must pass every wave)

- Login flow
- Session persistence / redirect guards
- Auth route protection behavior (`/admin`, `/register`, `/login` guard paths)

### Gate C — Rollback Safety

- One branch per wave
- One rollback tag per merged wave
- One **git commit per completed wave** before the next wave starts
- No migration applied without explicit migration checkpoint note

If any gate fails, stop and fix before continuing.

---

## 3) Scope and Blast Radius

### High-blast dependencies (defer until after refactor hardening)

- `@sveltejs/kit`, `svelte`, `vite`, `@sveltejs/vite-plugin-svelte`
- `prisma`, `@prisma/client`
- `@supabase/ssr`, `@supabase/supabase-js`
- `sveltekit-superforms`

### Medium-blast

- `square`
- UI libraries heavily used across forms/layouts
- **shadcn-svelte generated component ecosystem** (configured via `components.json`, runtime impact through `bits-ui`, `formsnap`, `cmdk-sv`, `vaul-svelte`, `tailwind-*`)

### Low-blast

- Lint/format/dev tooling with no runtime impact
- Minor utility packages not in auth/register critical path

---

## 4) Plan of Work (No Implementation Yet)

Execution mode (locked):

- Single-cycle program ending in **one production release**
- Target versions: **latest stable**
- Includes **package cleanup/hygiene** in same cycle
- **Single owner** for all waves
- **Fast cadence** execution (same-day handoff between waves when gates are green)

## Phase 0 — Planning Baseline (1 day)

Outputs:

- Version inventory (current -> target)
- Critical path checklist for Auth
- Upgrade wave matrix

Tasks:

1. Lock current state and document exact versions from `package.json` and lockfile.
2. Build a dependency matrix: runtime vs tooling, major/minor/patch, blast radius.
3. Confirm smoke checklist and owners.
4. Define cleanup checklist (remove duplicate runtime/dev deps, remove runtime-only packaging oddities).

Exit criteria:

- Inventory + wave matrix approved.

---

## Phase 1 — Refactor for Upgrade Safety (2–4 days)

Goal: reduce coupling and inconsistency before major upgrades.

Focus areas:

1. **Forms consistency**
   - Normalize superforms adapter usage patterns.
   - Remove stale/alternate adapter imports where present.
2. **Auth/session boundary**
   - Harden user/session shape handling in hooks and loaders.
   - Centralize assumptions used by route guards.
3. **DB boundary hardening**
   - Ensure transaction-safe boundaries and consistent helper usage.
4. **Payment adapter consistency**
   - Align square usage patterns to one approach.
5. **Package hygiene pre-work**
   - Remove duplicated or misplaced dependencies and normalize dependency sections.

Exit criteria:

- No behavior change expected.
- Gates A/B/C pass.

---

## Phase 2 — Low-Risk Upgrade Wave (1–2 days)

Goal: update low-blast tooling and non-critical libs first.

Tasks:

1. Upgrade lint/format/check tooling (where compatible).
2. Upgrade low-risk libraries not on auth/register runtime path.
3. Re-run gates and capture breakages.

Exit criteria:

- Build and checks stable.
- No Auth regressions.

---

## Phase 3 — Core Runtime Upgrade Wave (2–5 days)

Goal: update core framework stack in controlled order.

Recommended order:

1. `vite` + plugin compatibility
2. `svelte` + `@sveltejs/kit`
3. `sveltekit-superforms`
4. `@supabase/ssr` + `@supabase/supabase-js`
5. Runtime package cleanup validation (post-upgrade lockfile integrity and install reproducibility)

For each step:

- Upgrade one family at a time.
- Run gates A/B/C.
- Record any API adaptation needed.

Exit criteria:

- Auth critical path green.
- No unresolved type or runtime errors.

---

## Phase 4 — Prisma Upgrade + Schema/Migration Checkpoint (same cycle) (1–3 days)

Goal: complete data-layer upgrade safely.

Tasks:

1. Upgrade `prisma` + `@prisma/client` together.
2. Validate schema compatibility and generator/datasource settings.
3. Run migration status checks and generate if needed.
4. Validate DB behavior in register-related actions.

Exit criteria:

- No schema drift surprises.
- Migrations and runtime DB operations verified.
- Auth smoke remains green after Prisma wave.

---

## Phase 5 — Stabilization and Documentation (1 day)

Tasks:

1. Final pass of all gates.
2. Update plan docs with outcomes, exceptions, and deferred items.
3. Define post-upgrade cleanup backlog.

Exit criteria:

- Upgrade complete with documented known issues = none (or explicitly accepted).

---

## 5) Risk Register

1. **Framework major mismatch** (SvelteKit/Svelte/Vite)
   - Mitigation: upgrade family by family with hard gates.
2. **Prisma config/model drift**
   - Mitigation: isolate Prisma wave and validate migration state before/after.
3. **Auth/session contract changes**
   - Mitigation: treat hooks + route guards as protected surface with smoke tests.
4. **Superforms API changes**
   - Mitigation: normalize usage in Phase 1 before upgrades.

---

## 6) Confirmed Decisions (Locked)

1. Hard no-regression scope: **Auth only**
2. Prisma timing: **In same cycle**
3. Temporary non-critical UI regressions outside Auth: **Yes**
4. Release style: **One release**
5. Target policy: **Latest stable**
6. Package hygiene cleanup: **Included**

No further blocker questions remain for planning.

---

## 7) Initial Timeline (Estimate)

- Phase 0: 0.5–1 day
- Phase 1: 1–2 days
- Phase 2: 0.5–1 day
- Phase 3: 1–3 days
- Phase 4: 0.5–2 days
- Phase 5: 0.5 day

**Total (fast cadence, single owner)**: ~4 to 9 working days, depending on breakage.

---

## 8) Decision Snapshot

Final decision based on confirmed preferences:

> **Do Refactor First**, then execute upgrades in controlled waves with strict **Auth-only** regression gates, including Prisma and package cleanup in the same release cycle.

No code changes are planned in this document; this is planning only.

---

## 9) Execution Checklist (Task-by-Task, Wave-by-Wave)

Use this as the operational runbook. Do not start the next wave until all required checkboxes in the current wave are complete.

Ownership model:

- **Owner**: Single owner (same person across all tasks)
- **Handoff**: none (direct progression between waves)
- **Cadence rule**: proceed immediately to next wave once gates pass

Execution invariants (must always hold):

- Manual integrity test is required at end of each wave
- One git commit per completed wave before next wave begins
- `docs/FEATURES.md` is the canonical done/outstanding tracker for waves

Required context files for any new agent starting mid-program:

- `docs/plans/refactorOrUpgrade.md` (this document)
- `docs/FEATURES.md` (wave status)
- `package.json` and lockfile (dependency baseline/changes)
- `src/hooks.server.ts` (auth guard behavior)
- `src/lib/context.svelte.ts` (form/state coupling)
- `src/lib/components/server/registrationDB.ts` (DB behavior)
- `prisma/schema.prisma` (Prisma compatibility + migration impact)

### Program State Ledger (update as you go)

| Wave | Status      | Commit | Manual Test Result | Summary of What Was Completed | Known Issues / Follow-ups |
| ---- | ----------- | ------ | ------------------ | ----------------------------- | ------------------------- |
| 0    | Not started | TBD    | TBD                | TBD                           | TBD                       |
| 1    | Not started | TBD    | TBD                | TBD                           | TBD                       |
| 2    | Not started | TBD    | TBD                | TBD                           | TBD                       |
| 3    | Not started | TBD    | TBD                | TBD                           | TBD                       |
| 4    | Not started | TBD    | TBD                | TBD                           | TBD                       |
| 5    | Not started | TBD    | TBD                | TBD                           | TBD                       |

How to update this ledger:

- `Status`: Not started / In progress / Done
- `Commit`: commit SHA (short) and message for the wave completion commit
- `Manual Test Result`: Pass / Fail with brief note
- `Summary`: concise bullet-style sentence of completed scope
- `Known Issues`: only unresolved items carried to next wave

### Wave 0 — Preflight & Baseline Capture

- [ ] Create branch: `plan/refactor-upgrade-2026`
- [ ] Capture baseline versions from `package.json` + lockfile into a short table in this document
- [ ] Capture baseline quality status: lint, check, build results
- [ ] Capture baseline Auth smoke evidence:
  - [ ] Login works
  - [ ] Session persists after refresh
  - [ ] Route guards behave correctly for `/login`, `/admin`, `/register`
- [ ] Freeze feature work for the cycle
- [ ] Define rollback tags naming convention (e.g. `pre-wave-1`, `pre-wave-2`)

Exit gate:

- [ ] Gate A/B/C pass at baseline
- [ ] Manual integrity test complete and recorded in Program State Ledger
- [ ] Wave 0 completion commit created

### Wave 1 — Refactor Hardening (No Behavior Change)

#### 1A. Forms Consistency

- [ ] Inventory all `superForm(...)` usages and adapter imports
- [ ] Normalize on one adapter strategy and remove stale alternatives
- [ ] Ensure form IDs remain stable and unique where required

#### 1B. Auth Boundary Hardening

- [ ] Consolidate and document user/session assumptions used in hooks and guards
- [ ] Verify proxy/super-admin behavior does not alter auth safety guarantees
- [ ] Ensure protected-route checks are centralized and consistent

#### 1C. DB & Transaction Safety

- [ ] Verify write operations use consistent transaction boundaries where needed
- [ ] Remove inconsistent direct DB patterns that bypass agreed helpers

#### 1D. Payment Adapter Consistency

- [ ] Inventory all `square` client usage paths
- [ ] Align to one approach (remove mixed legacy/new style usage)

#### 1E. Package Hygiene Pre-work

- [ ] Remove duplicate dependency declarations across `dependencies` / `devDependencies`
- [ ] Move misplaced build/runtime tools to correct section
- [ ] Reinstall and verify lockfile determinism

Exit gate:

- [ ] Gate A pass
- [ ] Gate B (Auth smoke) pass
- [ ] Gate C rollback tag created
- [ ] Manual integrity test complete and recorded in Program State Ledger
- [ ] Wave 1 completion commit created

### Wave 2 — Low-Risk Upgrades

- [ ] Upgrade lint/format/typecheck tooling to latest stable
- [ ] Upgrade low-blast non-runtime libraries to latest stable
- [ ] Resolve any config breakage from tooling updates
- [ ] Re-run baseline quality checks

Exit gate:

- [ ] Gate A pass
- [ ] Gate B pass
- [ ] Rollback tag created before entering Wave 3
- [ ] Manual integrity test complete and recorded in Program State Ledger
- [ ] Wave 2 completion commit created

### Wave 3 — Core Runtime Upgrades

Order is strict; complete sub-wave gates each time.

#### 3A. Vite + Svelte Plugin

- [ ] Upgrade `vite`
- [ ] Upgrade `@sveltejs/vite-plugin-svelte`
- [ ] Verify SvelteKit compatibility matrix
- [ ] Validate dev/build behavior

Sub-wave gate:

- [ ] Gate A pass
- [ ] Gate B pass

#### 3B. Svelte + SvelteKit

- [ ] Upgrade `svelte`
- [ ] Upgrade `@sveltejs/kit`
- [ ] Apply required migration changes (if any)
- [ ] Validate route behavior + hooks compatibility

Sub-wave gate:

- [ ] Gate A pass
- [ ] Gate B pass

#### 3C. Superforms Stack

- [ ] Upgrade `sveltekit-superforms`
- [ ] Validate adapter compatibility and form action result handling
- [ ] Verify all auth-adjacent forms still submit and handle failures correctly

Sub-wave gate:

- [ ] Gate A pass
- [ ] Gate B pass

#### 3D. Supabase SSR/Auth Stack

- [ ] Upgrade `@supabase/ssr`
- [ ] Upgrade `@supabase/supabase-js`
- [ ] Verify session retrieval and token/user validation behavior in hooks

Sub-wave gate:

- [ ] Gate A pass
- [ ] Gate B pass

#### 3E. shadcn-svelte Ecosystem Validation

- [ ] Validate `components.json` expectations still match generated UI structure
- [ ] Upgrade and validate key generated-stack libraries (`bits-ui`, `formsnap`, `cmdk-sv`, `vaul-svelte`, `tailwind-*`)
- [ ] Confirm no auth-page blocking UI regressions

Sub-wave gate:

- [ ] Gate A pass
- [ ] Gate B pass

Wave 3 exit gate:

- [ ] All Wave 3 sub-wave gates pass
- [ ] Manual integrity test complete and recorded in Program State Ledger
- [ ] Wave 3 completion commit created

### Wave 4 — Prisma (Same Cycle)

- [ ] Upgrade `prisma` and `@prisma/client` together
- [ ] Verify schema compatibility (`generator`, `previewFeatures`, datasource)
- [ ] Run migration status review and document outcomes
- [ ] Regenerate Prisma artifacts and validate compile/runtime
- [ ] Verify auth-related DB calls still behave correctly

Exit gate:

- [ ] Gate A pass
- [ ] Gate B pass
- [ ] Migration checkpoint note added to this document
- [ ] Manual integrity test complete and recorded in Program State Ledger
- [ ] Wave 4 completion commit created

### Wave 5 — Final Stabilization & Release Prep

- [ ] Run full quality checks one last time
- [ ] Run final Auth smoke checklist and capture evidence
- [ ] Reconcile deferred issues and mark accepted exceptions
- [ ] Verify lockfile and install reproducibility on clean environment
- [ ] Prepare single release notes (breaking changes + rollback notes)
- [ ] Create final pre-release rollback tag

Release gate:

- [ ] All wave exit gates complete
- [ ] Single release approval granted
- [ ] Manual integrity test complete and recorded in Program State Ledger
- [ ] Wave 5 completion commit created

### Post-Release Checklist

- [ ] Monitor auth errors and session anomalies
- [ ] Monitor Prisma/database errors
- [ ] Monitor form submission failure rates
- [ ] Log follow-up cleanup tasks for next cycle

---

## 10) Phase Handoff Template (for starting any wave independently)

Copy this template into the active PR description or the first message to a new agent:

### Handoff Input

- Current wave: `WAVE_NUMBER`
- Last completed wave: `WAVE_NUMBER`
- Last completion commit: `SHA + message`
- Current branch: `branch-name`
- Open known issues carried forward:
  - `issue 1`
  - `issue 2`

### Required Reads

- This file (`docs/plans/refactorOrUpgrade.md`)
- `docs/FEATURES.md`
- Files listed under "Required context files for any new agent"

### Definition of Done for this wave

- All checklist items for the wave completed
- Gate A/B/C passed
- Manual integrity test recorded in Program State Ledger
- Wave completion commit created

### Output Required from agent

- Brief change summary
- Risks introduced/removed
- Exact manual test notes
- Commit message proposal for wave completion
