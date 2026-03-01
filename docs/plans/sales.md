# Admin Sales Route Plan

## Goal

Create a new admin route at `/admin/sales` to support a manual sales reconciliation workflow:

1. Select a time window (last 2/7/10 days or custom date range)
2. Fetch Square orders for that window via `squareOrderChecker`
3. Parse and match order line items to exhibition entries
4. Allow admin to mark matched entries as `sold = true`

This document is planning-only. No implementation changes are included.

---

## Scope

### In scope

- New route under admin sales:
  - `src/routes/(app)/admin/sales/+page.server.ts`
  - `src/routes/(app)/admin/sales/+page.svelte`
- Admin menu link to Sales page
- Date range UI with quick presets and custom range
- Read-only preview of retrieved orders and match outcomes
- Controlled action to update `entryTable.sold = true` for selected matched entries
- Structured logging for read and write operations

### Out of scope

- Automated tests (manual verification only for this work)
- Unsetting `sold` back to `false`
- Reworking `squareOrderChecker` internals beyond what is needed for integration

---

## Data & Matching Contract

### Order source

Use `getSquareOrdersSummary(startDate?, endDate?)` from:

- `src/lib/server/squareOrderChecker.ts`

### SKU matching rule (authoritative)

Line-item matching is by SKU in this exact semantic format:

`nnn - xxxxxxx - iiii`

Where:

- `nnn` = `exhibitNumber` (3 digits, preserve leading zeros)
- `xxxxxxx` = artist name
- `iiii` = entry id (integer)

### Ignore rule

- SKU exactly `Not Art` must be ignored from matching and update workflows.

### Recommended parser validation

- Regex: `^(\d{3})\s-\s(.+)\s-\s(\d+)$`
- Parsed fields:
  - `exhibitNumber: string`
  - `artistName: string`
  - `entryId: number`
- Normalize artist name before compare: trim, lowercase, collapse internal whitespace.

### Match criteria

A line item is `matched` only when all are true:

1. Parsed SKU is valid
2. `entryId` exists in exhibition entries
3. `exhibitNumber` equals entry location exhibit number
4. Normalized artist name matches normalized DB artist name

Anything else is classified as `unmatched`, `ambiguous`, `invalidSku`, or `ignoredNotArt`.

---

## UX Requirements (Svelte 5 + Tailwind + shadcn-svelte)

### Filters

- Quick range controls:
  - Last 2 days
  - Last 7 days
  - Last 10 days
- Custom date range:
  - Start date/time
  - End date/time

### Results sections

- Summary counters:
  - Total line items
  - Matched
  - Unmatched
  - Ambiguous
  - Invalid SKU
  - Ignored (`Not Art`)
- Table for raw/processed order rows
- Table for matched rows eligible for sold updates
- Optional expandable sections for invalid/unmatched diagnostics

### Update flow

- User selects one or more matched rows
- Confirmation step/dialog
- Server action updates `sold = true` only for selected matched entry IDs
- Return per-row outcome summary:
  - updated
  - already sold
  - failed

---

## Security, Permissions, and Logging

- Route remains under existing admin guard (`/admin` routes)
- Write action available only to admin users
- Use structured logger (`src/lib/server/logger.ts`) for:
  - read/sync request start + summary
  - parse/match summary counts
  - write action start + result counts
  - errors with `routeId` and user context

---

## Proposed File Changes (Plan Only)

### Create

- `src/routes/(app)/admin/sales/+page.server.ts`
- `src/routes/(app)/admin/sales/+page.svelte`
- Optional helper module (if needed):
  - `src/lib/server/sales-matching.ts`

### Update

- `src/lib/zod-schemas.ts`
  - Add schemas for:
    - date filter payload
    - selected matched IDs payload
- `src/lib/components/server/registrationDB.ts`
  - Reuse `updateEntry(...)` or add dedicated sold helper
- `src/lib/components/admin-menu.svelte`
  - Add Sales navigation item

---

## Phased Delivery Plan

## Phase 1 — Route contract and skeleton

**Objective:** Establish route and action contract with no DB writes.

### Tasks

- Define request/response shape for:
  - fetch by quick range
  - fetch by custom range
  - preview payload sections
- Scaffold `+page.server.ts` load/action placeholders
- Scaffold `+page.svelte` with filter controls and empty states

### Manual checkpoint (expected output)

- `/admin/sales` loads successfully
- Quick range and custom range controls render
- Submitting filter shows placeholder/read-only response area

---

## Phase 2 — Square read integration

**Objective:** Pull real order data for chosen date range.

### Tasks

- Wire filter inputs to server action
- Call `getSquareOrdersSummary(startDate?, endDate?)`
- Handle and surface API/date/token errors clearly
- Add structured logging around fetch operation

### Manual checkpoint (expected output)

- For valid date ranges, page displays returned orders/line items
- For invalid range or Square failure, clear actionable error message shown
- Logs contain read operation summary

---

## Phase 3 — SKU parsing and classification

**Objective:** Parse SKU and classify each line item before matching.

### Tasks

- Implement parser for `nnn - xxxxxxx - iiii`
- Ignore SKU `Not Art`
- Classify each line item:
  - `parsedValid`
  - `invalidSku`
  - `ignoredNotArt`
- Expose classification details in UI

### Manual checkpoint (expected output)

- Counters for valid, invalid, ignored are correct
- `Not Art` rows appear in ignored bucket and are excluded from candidate matches
- Invalid SKU rows show reason/code for manual review

---

## Phase 4 — Entry matching preview

**Objective:** Match parsed items to exhibition entries and show a safe preview.

### Tasks

- Retrieve candidate entries (including `entryId`, `exhibitNumber`, artist name)
- Match by parsed `entryId + exhibitNumber + artistName`
- Classify outcomes:
  - `matched`
  - `unmatched`
  - `ambiguous`
  - `alreadySold`
- Present grouped preview tables and summary counts

### Manual checkpoint (expected output)

- Matched rows are clearly identified and selectable
- Unmatched/ambiguous rows are non-selectable and include reason
- Already sold rows are visible and excluded from update action

---

## Phase 5 — Controlled sold updates

**Objective:** Update `entryTable.sold = true` for selected matched rows.

### Tasks

- Add update action accepting selected matched entry IDs
- Revalidate selection server-side before update
- Apply idempotent updates (`set true`, never toggle)
- Return granular result summary and refresh preview
- Add log records for update operation and outcomes

### Manual checkpoint (expected output)

- Selecting matched rows and confirming updates sets `sold = true`
- Re-running update on same rows reports already sold (no harmful effect)
- Result summary shows updated/already-sold/failed counts

---

## Phase 6 — UX polish + admin navigation

**Objective:** Make the workflow operationally smooth.

### Tasks

- Add Sales entry to admin menu
- Improve empty states, loading states, and confirmation messaging
- Ensure clear visual treatment for each outcome bucket

### Manual checkpoint (expected output)

- Sales page is discoverable from admin menu
- End-to-end flow works: choose range → review results → update sold flags
- UX is clear for both successful and partial-failure runs

---

## Manual Verification Checklist (No Automated Tests)

- [ ] Route available at `/admin/sales` and admin-only access enforced
- [ ] Quick ranges (2/7/10 days) return expected order windows
- [ ] Custom date range fetch works and validates start/end
- [ ] SKU parsing correctly interprets `nnn - xxxxxxx - iiii`
- [ ] SKU `Not Art` always ignored
- [ ] Matching requires exhibit number + artist name + entry id alignment
- [ ] Ambiguous and unmatched records never become update candidates
- [ ] Sold update action sets `sold = true` only
- [ ] Re-running updates is idempotent
- [ ] Errors are user-visible and logged with context

---

## Risks / Edge Cases

- Timezone boundaries can shift day-window results
- Artist name formatting differences may reduce matches without normalization
- Duplicate line items/orders can cause repeated candidates if not de-duped
- Malformed SKU values must not break the full run
- Entry may already be sold from prior operations; action must handle gracefully

---

## Rollback / Operational Safety

- Keep update action opt-in via explicit row selection and confirmation
- Keep non-matching categories read-only
- If needed, disable update action while preserving read-only preview

---

## Definition of Done

- Admin can filter and retrieve Square orders by date range
- SKU-driven matching and `Not Art` ignore behavior works as defined
- Admin can mark selected matched entries as sold
- Manual verification checklist completed successfully
