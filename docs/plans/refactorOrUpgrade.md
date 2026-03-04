# Refactor vs Upgrade Plan (Decision Document)

**Project**: SB-Reg-svelte5  
**Date**: 2026-03-04  
**Status**: Wave 3 complete; Wave 4 ready to start

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

| Wave | Status      | Commit                    | Manual Test Result        | Summary of What Was Completed                                                                                                                                                                                                                                                                                                                         | Known Issues / Follow-ups                                                                                                           |
| ---- | ----------- | ------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 0    | Done        | d0bcf3c - Wave 0 baseline | Pass (Auth smoke)         | Baseline inventory, quality checks, wave matrix, manual Auth smoke, lint recovery, and wave completion commit recorded.                                                                                                                                                                                                                               | Create rollback tag before entering Wave 1 (if not already created).                                                                |
| 1    | Done        | a279067 - Wave 1 closeout | Pass (manual)             | Forms/import patterns normalized, auth guard logic centralized, DB write paths aligned to helpers, payment API aligned to current SDK with consistent error shape, package hygiene cleanup applied.                                                                                                                                                   | Rollback tag created: `pre-wave-2-20260304`.                                                                                        |
| 2    | Done        | Wave 2 closeout commit    | Pass (manual auth smoke)  | Upgraded low-risk tooling/dev libraries (TypeScript, svelte-check, Prettier stack, ESLint 9-compatible set, PostCSS/Autoprefixer, tsx, low-blast dev utilities), resolved formatter drift, revalidated Gate A (`pnpm lint`, `pnpm check`, `pnpm build`), and completed manual Auth smoke validation.                                                  | Rollback tag created: `pre-wave-3-20260304`. ESLint v10 + eslint-plugin-svelte v3 lint-rule churn deferred to Wave 5 stabilization. |
| 3    | Done        | cbf896f - Wave 3 closeout | Pass (manual auth smoke)  | Upgraded core runtime stack in sequence: Vite + Svelte plugin, Svelte + SvelteKit, Superforms, Supabase SSR/Auth, and shadcn ecosystem dependencies (including Tailwind 4 migration updates for PostCSS/app stylesheet). Revalidated Gate A after each sub-wave (`pnpm lint`, `pnpm check`, `pnpm build`) and completed manual Auth smoke validation. | Existing non-blocking lint/build warnings remain (unused eslint-disable directives and externalized node:dns warning).              |
| 4    | Done        | 371346b - Wave 4 closeout | Pass (manual auth smoke)  | Prisma upgraded to v7.4.2 with adapter-based client wiring (`@prisma/adapter-pg` + `pg`), schema generator migrated to `prisma-client` with explicit output, new `prisma.config.ts` added for CLI env loading, all direct Prisma imports migrated to generated client paths, and Gate A (`pnpm lint`, `pnpm check`, `pnpm build`) passed.             | `zod-prisma-types` reports peer-range warning for Prisma 7; existing non-blocking build warning (`node:dns/promises`) remains.      |
| 5    | Not started | TBD                       | TBD                       | TBD                                                                                                                                                                                                                                                                                                                                                   | TBD                                                                                                                                 |

How to update this ledger:

- `Status`: Not started / In progress / Done
- `Commit`: commit SHA (short) and message for the wave completion commit
- `Manual Test Result`: Pass / Fail with brief note
- `Summary`: concise bullet-style sentence of completed scope
- `Known Issues`: only unresolved items carried to next wave

### Wave 0 — Preflight & Baseline Capture

- [x] Create branch: `plan/refactor-upgrade-2026`
- [x] Capture baseline versions from `package.json` + lockfile into a short table in this document
- [x] Capture baseline quality status: lint, check, build results
- [x] Capture baseline Auth smoke evidence:
  - [x] Login works
  - [x] Session persists after refresh
  - [x] Route guards behave correctly for `/login`, `/admin`, `/register`
- [x] Freeze feature work for the cycle
- [x] Define rollback tags naming convention (e.g. `pre-wave-1`, `pre-wave-2`)

#### Wave 0 Deliverable — Version Inventory (Current -> Target)

Source:

- Declared baseline: `package.json`
- Locked/resolved baseline: `pnpm list --depth 0 --json`
- Target policy: latest stable via `pnpm dlx npm-check-updates --target latest --jsonUpgraded`

| Package                      | Class               | Current (resolved) | Target (latest stable) | Change      |
| ---------------------------- | ------------------- | ------------------ | ---------------------- | ----------- |
| @sveltejs/kit                | Runtime core        | 2.49.1             | ^2.53.4                | Minor       |
| svelte                       | Runtime core        | 5.45.5             | ^5.53.7                | Minor       |
| vite                         | Runtime core        | 5.4.21             | ^7.3.1                 | Major       |
| @sveltejs/vite-plugin-svelte | Runtime core        | 4.0.0              | ^6.2.4                 | Major       |
| sveltekit-superforms         | Runtime critical    | 2.28.1             | ^2.30.0                | Minor       |
| @supabase/ssr                | Runtime critical    | 0.5.2              | ^0.9.0                 | Minor (0.x) |
| @supabase/supabase-js        | Runtime critical    | 2.48.1             | ^2.98.0                | Minor       |
| prisma                       | Runtime data layer  | 5.22.0             | ^7.4.2                 | Major       |
| @prisma/client               | Runtime data layer  | 5.22.0             | ^7.4.2                 | Major       |
| square                       | Runtime integration | 43.2.1             | ^44.0.0                | Major       |
| bits-ui                      | Runtime UI infra    | 1.8.0              | ^2.16.2                | Major       |
| formsnap                     | Runtime UI infra    | 2.0.1              | 2.0.1                  | None        |
| tailwindcss                  | Build/UI infra      | 3.4.17             | ^4.2.1                 | Major       |
| eslint                       | Tooling             | 9.19.0             | ^10.0.2                | Major       |
| prettier                     | Tooling             | 3.4.2              | ^3.8.1                 | Minor       |
| svelte-check                 | Tooling             | 4.1.4              | ^4.4.4                 | Minor       |
| typescript                   | Tooling             | 5.7.3              | ^5.9.3                 | Minor       |

#### Wave 0 Deliverable — Dependency Matrix (Runtime vs Tooling, Blast Radius)

| Group                  | Representative packages                                           | Upgrade profile     | Blast radius              | Planned wave           |
| ---------------------- | ----------------------------------------------------------------- | ------------------- | ------------------------- | ---------------------- |
| Runtime core framework | `@sveltejs/kit`, `svelte`, `vite`, `@sveltejs/vite-plugin-svelte` | Mixed minor + major | High                      | 3                      |
| Runtime auth/session   | `@supabase/ssr`, `@supabase/supabase-js`                          | Minor (0.x + 2.x)   | High                      | 3                      |
| Runtime forms          | `sveltekit-superforms`                                            | Minor               | High (form flow critical) | 3                      |
| Runtime data layer     | `prisma`, `@prisma/client`                                        | Major               | High                      | 4                      |
| Runtime payments       | `square`                                                          | Major               | Medium                    | 1D then 3/4 validation |
| Runtime UI ecosystem   | `bits-ui`, `formsnap`, `cmdk-sv`, `vaul-svelte`, `tailwind-*`     | Mixed major/minor   | Medium                    | 3 + 5 stabilization    |
| Tooling & quality      | `eslint`, `prettier`, `typescript`, `svelte-check`                | Mixed major/minor   | Low                       | 2                      |

#### Wave 0 Deliverable — Baseline Quality Status (Gate A Inputs)

| Command      | Result | Notes                                                                      |
| ------------ | ------ | -------------------------------------------------------------------------- |
| `pnpm lint`  | Pass   | Prettier is clean and ESLint runs successfully (warnings only, no errors). |
| `pnpm check` | Pass   | `svelte-check` found 0 errors / 0 warnings.                                |
| `pnpm build` | Pass   | Production build succeeds; non-blocking warnings only.                     |

#### Wave 0 Deliverable — Baseline Auth Smoke Evidence (Gate B Inputs)

| Check                                            | Result                 | Evidence                                                                                                     |
| ------------------------------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| Login works                                      | Pass (manual)          | Manually verified successful login flow in browser.                                                          |
| Session persists after refresh                   | Pass (manual)          | Manually verified active session is retained after browser refresh.                                          |
| Route guards for `/login`, `/admin`, `/register` | Pass (code inspection) | Verified guard logic and redirects in `src/hooks.server.ts` against auth/admin/registration-open conditions. |

#### Wave 0 Deliverable — Ownership, Freeze, Rollback Conventions

- Owner confirmed: single owner model retained.
- Feature freeze: active from 2026-03-04 through end of wave program (except wave-scoped upgrade/refactor tasks).
- Rollback tag naming convention: `pre-wave-<n>-YYYYMMDD` (example: `pre-wave-1-20260304`).

#### Wave 0 Deliverable — Package Cleanup Checklist (for Wave 1E execution)

- Remove duplicate package declaration: `@sveltejs/vite-plugin-svelte` appears in both `dependencies` and `devDependencies`.
- Reclassify package manager dependency: remove `pnpm` from runtime `dependencies` unless explicitly required at runtime.
- Audit runtime vs dev-only placement for tooling/build libraries and normalize sections.
- Reinstall and confirm lockfile determinism after cleanup.

Exit gate:

- [x] Gate A/B/C pass at baseline
- [x] Manual integrity test complete and recorded in Program State Ledger
- [x] Wave 0 completion commit created

### Wave 1 — Refactor Hardening (No Behavior Change)

#### 1A. Forms Consistency

- [x] Inventory all `superForm(...)` usages and adapter imports
- [x] Normalize on one adapter strategy and remove stale alternatives
- [x] Ensure form IDs remain stable and unique where required

#### 1B. Auth Boundary Hardening

- [x] Consolidate and document user/session assumptions used in hooks and guards
- [x] Verify proxy/super-admin behavior does not alter auth safety guarantees
- [x] Ensure protected-route checks are centralized and consistent

#### 1C. DB & Transaction Safety

- [x] Verify write operations use consistent transaction boundaries where needed
- [x] Remove inconsistent direct DB patterns that bypass agreed helpers

#### 1D. Payment Adapter Consistency

- [x] Inventory all `square` client usage paths
- [x] Align to one approach (remove mixed legacy/new style usage)

#### 1E. Package Hygiene Pre-work

- [x] Remove duplicate dependency declarations across `dependencies` / `devDependencies`
- [x] Move misplaced build/runtime tools to correct section
- [x] Reinstall and verify lockfile determinism

Exit gate:

- [x] Gate A pass
- [x] Gate B (Auth smoke) pass
- [x] Gate C rollback tag created
- [x] Manual integrity test complete and recorded in Program State Ledger
- [x] Wave 1 completion commit created

### Wave 2 — Low-Risk Upgrades

- [x] Upgrade lint/format/typecheck tooling to latest stable (or latest compatible major where required)
- [x] Upgrade low-blast non-runtime libraries to latest stable
- [x] Resolve any config breakage from tooling updates
- [x] Re-run baseline quality checks

Exit gate:

- [x] Gate A pass
- [x] Gate B pass
- [x] Rollback tag created before entering Wave 3
- [x] Manual integrity test complete and recorded in Program State Ledger
- [x] Wave 2 completion commit created

### Wave 3 — Core Runtime Upgrades

Order is strict; complete sub-wave gates each time.

#### 3A. Vite + Svelte Plugin

- [x] Upgrade `vite`
- [x] Upgrade `@sveltejs/vite-plugin-svelte`
- [x] Verify SvelteKit compatibility matrix
- [x] Validate dev/build behavior

Sub-wave gate:

- [x] Gate A pass
- [x] Gate B pass

#### 3B. Svelte + SvelteKit

- [x] Upgrade `svelte`
- [x] Upgrade `@sveltejs/kit`
- [x] Apply required migration changes (if any)
- [x] Validate route behavior + hooks compatibility

Sub-wave gate:

- [x] Gate A pass
- [x] Gate B pass

#### 3C. Superforms Stack

- [x] Upgrade `sveltekit-superforms`
- [x] Validate adapter compatibility and form action result handling
- [x] Verify all auth-adjacent forms still submit and handle failures correctly

Sub-wave gate:

- [x] Gate A pass
- [x] Gate B pass

#### 3D. Supabase SSR/Auth Stack

- [x] Upgrade `@supabase/ssr`
- [x] Upgrade `@supabase/supabase-js`
- [x] Verify session retrieval and token/user validation behavior in hooks

Sub-wave gate:

- [x] Gate A pass
- [x] Gate B pass

#### 3E. shadcn-svelte Ecosystem Validation

- [x] Validate `components.json` expectations still match generated UI structure
- [x] Upgrade and validate key generated-stack libraries (`bits-ui`, `formsnap`, `cmdk-sv`, `vaul-svelte`, `tailwind-*`)
- [x] Confirm no auth-page blocking UI regressions

Sub-wave gate:

- [x] Gate A pass
- [x] Gate B pass

Wave 3 exit gate:

- [x] All Wave 3 sub-wave gates pass
- [x] Manual integrity test complete and recorded in Program State Ledger
- [x] Wave 3 completion commit created

### Wave 4 — Prisma (Same Cycle)

Decision for SvelteKit integration (confirmed before implementation):

- Runtime app code should continue using SvelteKit server env modules (for example `$env/static/private` / `$env/dynamic/private`) where env access is needed.
- Prisma CLI behavior in v7 is different: CLI env vars are **not auto-loaded** by default, so Wave 4 will add explicit env loading in `prisma.config.ts` (using `dotenv/config`) for migration/generate/seed workflows.
- This means: **no standalone dotenv wiring is required across regular SvelteKit server routes just to run Prisma queries**; dotenv is required for Prisma CLI configuration.

#### 4A. Package + adapter baseline

- [x] Upgrade `prisma` and `@prisma/client` together to latest v7 stable
- [x] Add Postgres driver adapter dependency (`@prisma/adapter-pg`) and `pg` runtime dependency if not already present
- [x] Confirm Node/TypeScript prerequisites for Prisma 7 are satisfied in this repo

#### 4B. Prisma schema + config migration

- [x] Update `prisma/schema.prisma` generator from `prisma-client-js` to `prisma-client`
- [x] Add required generator `output` path for generated client (repo-local path, not `node_modules`)
- [x] Review/remove Prisma 6-only generator fields no longer required for v7 flow
- [x] Add root `prisma.config.ts` with explicit env loading and datasource config

#### 4C. Runtime client wiring in SvelteKit

- [x] Update Prisma client module in [src/lib/components/server/prisma.ts](src/lib/components/server/prisma.ts) to instantiate client via Prisma 7 adapter pattern
- [x] Replace imports from `@prisma/client` with imports from generated client output path in server/runtime code
- [x] Keep one shared server-side client boundary and preserve existing call sites via same exported `prisma` symbol

#### 4D. Script and type import migration

- [x] Update all project scripts importing `@prisma/client` to generated-client imports (and adapter where needed)
- [x] Validate `Prisma` type-only imports still compile after generated-path migration

#### 4E. CLI/workflow changes (v7-specific)

- [x] Update npm/pnpm scripts if needed for explicit `prisma generate` / `prisma db seed` execution
- [x] Verify migration commands behavior under `prisma.config.ts`
- [x] Record any command syntax changes used during Wave 4 in this document

Wave 4 command notes (v7):

- `pnpm prisma generate` is required explicitly after schema/generator changes.
- `db:migrate` script updated to run `prisma migrate dev && prisma generate`.
- `db:reset` script updated to run `prisma migrate reset --force && prisma generate && prisma db seed`.
- `db:seed` script now uses `prisma db seed` (seed command configured in `prisma.config.ts`).

#### 4F. Verification and checkpoints

- [x] Run migration status review and document outcomes
- [x] Regenerate Prisma artifacts and validate compile/runtime
- [x] Verify auth-related DB calls still behave correctly
- [x] Run manual DB smoke for register flow write/read paths (artist create, registration read, entry read)

Migration checkpoint note:

- `prisma migrate status` result: **Database schema is up to date**, 6 migrations found.
- `prisma generate` result: **Prisma Client 7.4.2 generated** to `src/lib/generated/prisma`.
- Gate A status after Wave 4 changes: `pnpm lint` pass (warnings only), `pnpm check` pass, `pnpm build` pass.

Expected file touch-list for Wave 4 (minimum):

- [x] [package.json](package.json)
- [x] [prisma/schema.prisma](prisma/schema.prisma)
- [x] [prisma.config.ts](prisma.config.ts) (new)
- [x] [src/lib/components/server/prisma.ts](src/lib/components/server/prisma.ts)
- [x] [src/lib/components/server/registrationDB.ts](src/lib/components/server/registrationDB.ts)
- [x] scripts under [scripts/](scripts/) and [src/scripts/](src/scripts/) that import Prisma client directly

Exit gate:

- [x] Gate A pass
- [x] Gate B pass
- [x] Migration checkpoint note added to this document
- [x] Manual integrity test complete and recorded in Program State Ledger
- [x] Wave 4 completion commit created

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
