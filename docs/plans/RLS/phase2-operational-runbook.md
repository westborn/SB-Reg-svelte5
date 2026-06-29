# Phase 2 Operational Runbook: Cloud Clone Provisioning and Proof Environment Setup

Status: Ready to execute manually  
Owner: Project maintainer  
Phase target: Phase 2 from the RLS migration plan

---

## 1) Objective

Create a safe, production-like cloud database clone for RLS proving work, with:

- production-equivalent schema/data fidelity
- no accidental production traffic
- no accidental real-world side effects (email, media, automations)
- repeatable snapshot/restore workflow
- evidence package for Phase 3 handoff

---

## 2) Inputs and references

Use these files as the source of truth while executing:

- docs/plans/RLS/updateToRLS.md
- docs/plans/RLS/phase1-rollout-gates.md
- docs/plans/RLS/phase1-access-inventory.md
- docs/plans/RLS/phase1-ownership-matrix.md
- docs/plans/RLS/phase1-integrity-baseline.md
- docs/plans/RLS/phase1-integrity-checks.sql
- prisma/schema.prisma
- src/hooks.server.ts
- src/lib/components/server/cloudinary.ts
- env.local
- scripts/validate-phase-6-1.sql
- scripts/validate-primary-images.ts

---

## 3) Exit criteria (what "done" means)

Phase 2 is complete only when all are true:

- [ ] Cloud clone exists and is isolated from production
- [ ] Clone matches production for PostgreSQL major version, schema, and expected row counts
- [ ] Clone has side-effect protections (email/media/automation)
- [ ] Prisma app can connect and run normal server operations against clone
- [ ] Baseline integrity checks pass on clone
- [ ] Snapshot and restore tested at least once
- [ ] Evidence package captured and saved for gate review

---

## 4) Preconditions checklist (do not start until complete)

- [ ] Phase 1 artifacts reviewed and accepted
- [ ] Rollout gate status reviewed; no blockers for Phase 2 start
- [ ] Production access approved for controlled read/export/clone only
- [ ] Maintainer list and access boundaries documented
- [ ] A secure place exists for temporary credentials

If any item is not complete, stop and resolve before provisioning.

---

## 5) Manual execution steps

### Step 0: Create execution record

1. Create a dated execution note file:
   - docs/plans/RLS/phase2-execution-log-YYYY-MM-DD.md
2. Record:
   - operator name
   - date/time
   - source production environment identifier
   - target clone environment identifier
   - change window

Checkpoint evidence:

- [ ] Execution log started

---

### Step 1: Confirm gate readiness from Phase 1

1. Open and verify outcomes in:
   - docs/plans/RLS/phase1-access-inventory.md
   - docs/plans/RLS/phase1-ownership-matrix.md
   - docs/plans/RLS/phase1-integrity-baseline.md
2. Confirm gate states in:
   - docs/plans/RLS/phase1-rollout-gates.md
3. Record "Phase 2 start approved" in execution log.

Checkpoint evidence:

- [ ] Gate readiness note added

Rollback point:

- If gate review fails, stop and return to Phase 1 actions.

---

### Step 2: Provision isolated cloud full-copy DB

1. In your DB provider console, create a new non-production database instance for RLS proving.
2. Ensure:
   - same PostgreSQL major version as production
   - required extensions match production
   - networking and credentials are isolated from production
3. Create full data copy from production into clone.

#### Step 2.3 Command reference: full data copy

Use one of the following approaches.

##### Option A (preferred): provider snapshot/clone

If your DB provider supports cloning from snapshot, use that workflow in the provider console.

Why preferred:

- preserves provider-level configuration more reliably
- usually faster for large datasets
- lower operator error risk versus manual dump/restore

##### Option B: PostgreSQL logical copy (`pg_dump` + `pg_restore`)

Use this when provider snapshot clone is not available.

1. Export full production database:

```bash
pg_dump "postgresql://<prod_user>:<prod_pass>@<prod_host>:5432/<prod_db>" \
   --format=custom \
   --no-owner \
   --no-privileges \
   --verbose \
   --file=prod-full.dump
```

What it does:

- `--format=custom`: creates a restorable archive
- `--no-owner --no-privileges`: avoids role/permission conflicts on restore target
- `--file=prod-full.dump`: writes the backup artifact

2. Restore into clone database:

```bash
pg_restore \
   --dbname="postgresql://<clone_user>:<clone_pass>@<clone_host>:5432/<clone_db>" \
   --clean \
   --if-exists \
   --no-owner \
   --no-privileges \
   --verbose \
   prod-full.dump
```

What it does:

- `--clean --if-exists`: drops existing objects before recreate
- `--no-owner --no-privileges`: keeps restore compatible in non-production role model
- `prod-full.dump`: source archive to import

3. Compare critical table row counts (production vs clone):

```bash
psql "<prod_url>" -c "select 'artist' t, count(*) from artist union all select 'registration', count(*) from registration union all select 'entry', count(*) from entry union all select 'image', count(*) from image union all select 'primary_image', count(*) from primary_image union all select 'location', count(*) from location;"
psql "<clone_url>" -c "select 'artist' t, count(*) from artist union all select 'registration', count(*) from registration union all select 'entry', count(*) from entry union all select 'image', count(*) from image union all select 'primary_image', count(*) from primary_image union all select 'location', count(*) from location;"
```

4. Save outputs to the Phase 2 evidence folder:

- `03-schema-parity-report.md`
- `04-row-count-parity.csv` (or `.md`)

4. Assign least-privilege operator credentials for clone administration.
5. Label the environment clearly (example: "RLS-PROVING-CLONE-NONPROD").

Checkpoint evidence:

- [ ] Clone instance created
- [ ] Version parity confirmed
- [ ] Extension parity confirmed
- [ ] Full data copy completed
- [ ] Access restrictions applied

Rollback point:

- If version/extension parity cannot be achieved, recreate clone before continuing.

---

### Step 3: Establish connection and environment isolation

1. Prepare a dedicated local environment file for clone testing (example: .env.local.rls-clone).
2. Set clone-only values for:
   - DATABASE_URL
   - PUBLIC_SUPABASE_URL
   - PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - LOG_LEVEL (set to INFO or DEBUG during proving)
3. Do not reuse production credentials in local/dev workflows.
4. Ensure app runtime for this phase always points to clone configuration.

Checkpoint evidence:

- [ ] Clone env file created
- [ ] No production credentials in active run context

Rollback point:

- If uncertain which DB is active, stop and verify before running any scripts.

---

### Step 4: Sanitize side-effect integrations

Implement these safeguards before any app/script execution on clone:

#### 4A) Email safety

1. Disable outbound real email or reroute to a sandbox inbox.
2. Replace GMAIL_USER and GMAIL_APP_PASSWORD in clone runtime with non-production values.
3. Validate one test flow does not send to real artist addresses.

#### 4B) Media upload safety

1. Use a non-production Cloudinary account/folder/preset.
2. Replace Cloudinary env values for clone runtime.
3. Validate uploaded media is isolated from production library.

#### 4C) Automation/script safety

1. Identify scripts/jobs that can mutate data or trigger external systems.
2. Disable scheduler/webhooks/background triggers for clone.
3. Require operator confirmation before running any destructive script.

Checkpoint evidence:

- [ ] Email side effects neutralized
- [ ] Media side effects neutralized
- [ ] Automations disabled/controlled

Rollback point:

- If any real-world side effect is observed, stop immediately, rotate affected credentials, and re-baseline clone.

---

### Step 5: Validate clone fidelity (schema + data + app connectivity)

1. Compare schema with production using provider tooling and prisma/schema.prisma.
2. Validate critical relational characteristics:
   - cascade paths intact
   - one-to-one constraints intact (primary image, location)
3. Compare row counts for critical tables:
   - artist
   - registration
   - entry
   - image
   - primary_image
   - location
   - log
4. Run application connection smoke tests against clone:
   - app starts
   - basic authenticated route operations work
   - register/admin read operations execute normally

Checkpoint evidence:

- [ ] Schema parity report saved
- [ ] Row count comparison saved
- [ ] App connectivity smoke test results saved

Rollback point:

- If schema or count drift is unexplained, recreate clone and repeat from Step 2.

---

### Step 6: Run integrity baseline checks on clone

1. Run SQL checks from:
   - docs/plans/RLS/phase1-integrity-checks.sql
2. Run existing validation assets:
   - scripts/validate-phase-6-1.sql
   - scripts/validate-primary-images.ts
3. Save full outputs in the evidence log and/or attached artifacts.
4. Resolve any integrity failures before proceeding.

Checkpoint evidence:

- [ ] Integrity SQL output saved
- [ ] Validation script outputs saved
- [ ] All failures resolved or formally waived

Rollback point:

- If unresolved integrity issues remain, stop Phase 2 completion and open remediation tasks.

---

### Step 7: Rehearse migration safety on clone

1. Rehearse non-RLS migrations/processes currently in repo against clone.
2. Confirm Prisma migration tooling can run in clone context without unexpected failures.
3. Confirm no migration step requires production-only access assumptions.
4. Record elapsed time, errors, and remediation notes.

Checkpoint evidence:

- [ ] Migration rehearsal completed
- [ ] Issues documented and triaged

Rollback point:

- If migration rehearsal fails critically, return to clone hardening and rerun Step 5 and Step 6.

---

### Step 8: Prove snapshot/restore workflow

1. Create a named baseline snapshot after successful checks.
2. Perform controlled mutation in clone (safe test data change).
3. Restore from baseline snapshot.
4. Re-run key integrity checks to prove restoration fidelity.
5. Document RTO/RPO observations for planning.

Checkpoint evidence:

- [ ] Snapshot created
- [ ] Restore executed successfully
- [ ] Post-restore integrity checks pass

Rollback point:

- If restore is unreliable or slow beyond acceptable threshold, stop and fix backup/restore process before Phase 3.

---

### Step 9: Freeze clean baseline for Phase 3

1. Create final "Phase-2-clean" snapshot.
2. Record exact identifiers:
   - snapshot ID
   - timestamp
   - clone DB identifier
   - git commit SHA used for validation
3. Mark Phase 2 complete in execution log.

Checkpoint evidence:

- [ ] Clean baseline snapshot finalized
- [ ] Phase 3 handoff metadata captured

---

## 6) Evidence package template (attach to gate review)

Create a folder for artifacts:

- docs/plans/RLS/evidence/phase2/YYYY-MM-DD/

Required files:

- [ ] 01-execution-log.md
- [ ] 02-clone-provisioning-summary.md
- [ ] 03-schema-parity-report.md
- [ ] 04-row-count-parity.csv (or .md)
- [ ] 05-side-effect-safety-checklist.md
- [ ] 06-integrity-check-results.md
- [ ] 07-migration-rehearsal-results.md
- [ ] 08-snapshot-restore-test.md
- [ ] 09-phase2-handoff.md

---

## 7) Go/No-Go decision matrix

Go to Phase 3 only if all are Yes:

- [ ] Fidelity checks passed
- [ ] Integrity checks passed
- [ ] Side effects neutralized
- [ ] Snapshot/restore proven
- [ ] Evidence package complete

If any item is No: No-Go, remediate, retest, re-review.

---

## 8) Common failure patterns and immediate actions

1. Wrong environment targeted
   - Immediate action: stop all writes, verify active DATABASE_URL, rotate credentials if needed.
2. Unexpected email/media side effects
   - Immediate action: disable integrations, revoke keys, re-baseline clone.
3. Integrity check failures after clone copy
   - Immediate action: recopy from production and rerun baseline checks.
4. Restore inconsistency
   - Immediate action: escalate to DB platform support, do not start Phase 3.

---

## 9) Final sign-off block

- Phase 2 owner: **\*\*\*\***\_\_\_\_**\*\*\*\***
- Date: **\*\*\*\***\_\_\_\_**\*\*\*\***
- Gate reviewer: **\*\*\*\***\_\_\_\_**\*\*\*\***
- Decision: GO / NO-GO
- Notes: **\*\*\*\***\_\_\_\_**\*\*\*\***
