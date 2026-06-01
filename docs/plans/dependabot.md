# Dependabot Security Advisory Resolution Plan

## Project: SB-Reg-svelte5 (Sculpture Bermagui Registration System)

**Project Version:** 2.2.1  
**Date Updated:** March 12, 2026  
**Repository:** https://github.com/westborn/SB-Reg-svelte5

---

## Current Status

The old Dependabot plan no longer reflects the current repository state.

### What is already done

The project has already moved the major direct dependencies to current versions, including:

- `@sveltejs/kit` → `^2.54.0`
- `vite` → `^7.3.1`
- `svelte` → `^5.53.10`
- `prisma` / `@prisma/client` / `@prisma/adapter-pg` → `^7.5.0`
- `nodemailer` → `^8.0.2`
- `cloudinary` → `^2.9.0`
- `square` → `^44.0.0`
- `glob` → `^13.0.6`
- `@supabase/supabase-js` → `^2.99.1`

### Current audit summary

```bash
pnpm audit --json
# 0 critical / 2 high / 8 moderate / 2 low
```

### Current blocker

The remaining high-severity alerts are no longer on direct app dependencies. They come from Prisma’s transitive tooling tree:

- `.>prisma>@prisma/dev>hono` (`4.11.4`)
- `.>prisma>@prisma/dev>@hono/node-server` (`1.19.9`)

So the active Dependabot work is now mostly about transitive remediation through Prisma, not the older `glob` / `valibot` / `validator` issues.

---

## Open Dependabot-Relevant Alerts

## High Priority

### 1. `hono` via Prisma

**Path:** `.>prisma>@prisma/dev>hono`  
**Installed:** `4.11.4`  
**Fix target:** `>=4.12.7`

Open advisories on this path include:

- High: `GHSA-q5qw-h33p-qvwr` / `CVE-2026-29045`
- Moderate: `GHSA-9r54-q6cx-xmh5`
- Moderate: `GHSA-6wqw-2p9w-4vw4`
- Moderate: `GHSA-r354-f388-2fhh`
- Moderate: `GHSA-w332-q679-j88p`
- Moderate: `GHSA-5pq2-9x2x-5p6w`
- Moderate: `GHSA-p6xx-57qc-3wxr`
- Moderate: `GHSA-v8w9-8mx6-g223`
- Low: `GHSA-gq3j-xvxp-8hrf`

### 2. `@hono/node-server` via Prisma

**Path:** `.>prisma>@prisma/dev>@hono/node-server`  
**Installed:** `1.19.9`  
**Fix target:** `>=1.19.10`

Open advisory:

- High: `GHSA-wc8c-qw6v-h7f6` / `CVE-2026-29087`

### 3. `lodash` via Prisma tooling

**Path:** `.>prisma>@prisma/dev>@mrleebo/prisma-ast>chevrotain>lodash`  
**Installed:** `4.17.21`  
**Fix target:** `>=4.17.23`

Open advisory:

- Moderate: `GHSA-xxjr-mmjv-4gpg` / `CVE-2025-13465`

### 4. `cookie` via SvelteKit

**Path:** `.>@sveltejs/kit>cookie`  
**Installed:** `0.6.0`  
**Fix target:** `>=0.7.0`

Open advisory:

- Low: `GHSA-pxg6-pf52-xh8x` / `CVE-2024-47764`

---

## Items No Longer Needing Action

These items were central in the older plan but are no longer current audit blockers:

- `glob` high-severity issue
- `valibot` ReDoS issue
- `validator` via `@vinejs/vine`
- older `vite` filesystem bypass issues
- older `@sveltejs/kit` direct XSS issue
- older `nodemailer` direct advisories

They should remain historical context only, not active remediation targets.

---

## Updated Resolution Strategy

### Phase 1: Prefer Upstream Prisma Fixes

Because Prisma owns the vulnerable transitive subtree, the safest fix path is:

```bash
pnpm update prisma @prisma/client @prisma/adapter-pg
pnpm audit
```

**Success criteria:**

- Prisma pulls a newer `@prisma/dev`
- `hono` resolves to `>=4.12.7`
- `@hono/node-server` resolves to `>=1.19.10`
- audit high count drops from `2` to `0`

### Phase 2: Temporary Overrides If Prisma Lags

If Prisma does not yet pull fixed versions, use short-lived overrides and validate carefully:

```json
{
	"pnpm": {
		"overrides": {
			"hono": "^4.12.7",
			"@hono/node-server": "^1.19.10",
			"lodash": "^4.17.23",
			"cookie": "^0.7.0"
		}
	}
}
```

These affect Prisma toolchain internals, so they should be treated as compatibility-sensitive.

### Phase 3: Validation Before Closure

After any remediation:

```bash
pnpm install
pnpm audit
pnpm check
pnpm build
pnpm lint
pnpm prisma generate
```

Manual smoke tests:

- auth flow
- registration flow
- entry/image management flow
- Prisma generate / migrate / studio workflows
- Netlify build path if relevant

---

## Recommended PR Sequence

### PR 1: Prisma refresh

- update `prisma`, `@prisma/client`, `@prisma/adapter-pg`
- rerun `pnpm audit`
- if highs clear, stop here

### PR 2: Override-based remediation (only if needed)

- add `pnpm.overrides` for `hono`, `@hono/node-server`, `lodash`, `cookie`
- validate Prisma CLI and app runtime
- rerun audit and build/test commands

### PR 3: Cleanup

- remove temporary overrides once upstream packages naturally carry the fixes
- refresh the planning docs again

---

## Tracking Checklist

- [x] Direct dependencies updated to current March 2026 baseline
- [x] `pnpm audit` rerun against current dependency tree
- [ ] Prisma release checked for fixed transitives
- [ ] Decide whether to use temporary overrides
- [ ] Re-run `pnpm audit` after remediation
- [ ] Confirm `0` high vulnerabilities
- [ ] Confirm Prisma workflows still work
- [ ] Update documentation after closure

---

## Bottom Line

Dependabot follow-up for this repo is now mostly about **transitive risk management**:

- direct app packages are largely up to date
- remaining highs are inside Prisma’s tooling tree
- the next real action is either an upstream Prisma refresh or a carefully tested override strategy
