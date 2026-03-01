# Admin Sales Route Plan (As-Built Through Phase 5)

## Goal

Support a manual admin reconciliation workflow at `/admin/sales`:

1. Select a time window (last 2/7/10 days or custom date range)
2. Fetch Square order summary rows for that window
3. Parse and classify SKU rows
4. Match line items to exhibition entries
5. Allow admin to mark selected matched entries as `sold = true`

This plan has been updated to reflect the current implementation in the sales route so further iteration can continue from current state.

---

## Current Implementation Snapshot

Implemented route files:

- `src/routes/(app)/admin/sales/+page.server.ts`
- `src/routes/(app)/admin/sales/+page.svelte`

Implemented actions:

- `preview` action: validates filter, fetches Square rows, classifies/matches, returns preview payload
- `updateSold` action: re-fetches and revalidates eligibility server-side, updates selected entries with `sold = true`, returns result counts

Important current behavior details:

- Quick ranges are computed client-side as date-only values (midnight-to-midnight).
- Custom range currently uses date inputs (not date-time inputs).
- Matching is strict on:
  - `entryId`
  - `exhibitNumber`
  - artist name (normalized, `includes`-based comparison)
  - price in cents (`baseAmountCents === exhibit.price`)
- `Not Art` SKU rows are ignored.
- Canceled rows are explicitly excluded from sold updates.
- Sold updates are idempotent (`sold` is only ever set to `true`).
- Structured logging is present for key fetch/update success and failure paths.

Known gaps still visible in current state:

- No admin menu link to Sales yet.
- No confirmation dialog before sold update submit.
- Some fallback/default copy still references earlier phase messaging.
- Default filter dates are hard-coded to 2025 values.

---

## Scope

### In scope (current)

- New route under admin sales:
  - `src/routes/(app)/admin/sales/+page.server.ts`
  - `src/routes/(app)/admin/sales/+page.svelte`
- Date range UI with quick presets and custom range
- Read-only preview of retrieved orders and match outcomes
- Controlled action to update `entryTable.sold = true` for selected matched entries
- Structured logging for read and write operations

### Out of scope (current)

- Automated tests (manual verification only for this work)
- Unsetting `sold` back to `false`
- Reworking `squareOrderChecker` internals beyond what is needed for integration

---

## Data & Matching Contract (Current)

### Order source

Use `SquareOrderChecker.getOrderSummaryByDateRange(startDate, endDate)` from:

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
4. Normalized artist name comparison passes (`dbArtistName.includes(skuArtistName)` after normalization)
5. Line amount in cents equals entry price in cents

Anything else is classified as `unmatched`, `ambiguous`, `invalidSku`, `ignoredNotArt`, `alreadySold`, or `canceled`.

---

## UX Requirements (Svelte 5 + Tailwind + shadcn-svelte)

### Filters (implemented)

- Quick range controls:
  - Last 2 days
  - Last 7 days
  - Last 10 days
- Custom date range:
  - Start date
  - End date

### Results sections (implemented)

- Summary counters:
  - Total line items
  - Matched
  - Canceled
  - Already sold
  - Unmatched
  - Ambiguous
  - Invalid SKU
  - Ignored (`Not Art`)
- Table for all order rows
- Table for matched rows eligible for sold updates (with row selection)
- Tables for canceled, already sold, unmatched, ambiguous, parsed-valid, invalid SKU, ignored Not Art rows

### Update flow (implemented)

- User selects one or more matched rows
- Server action updates `sold = true` only for selected matched entry IDs
- Server revalidates eligible rows before write by re-fetching and rematching
- Return outcome summary:
  - updated
  - already sold
  - not eligible
  - failed

---

## Security, Permissions, and Logging

- Route remains under existing admin guard (`/admin` routes)
- Write action is under `/admin` route guard (admin only via existing hook guard)
- Use structured logger (`src/lib/server/logger.ts`) for:
  - read/sync request start + summary
  - parse/match summary counts
  - write action start + result counts
  - errors with `routeId` and user context

---

## Implemented File Changes (Phases 1-5)

### Created

- `src/routes/(app)/admin/sales/+page.server.ts`
- `src/routes/(app)/admin/sales/+page.svelte`

### Reused Existing

- `src/lib/components/server/registrationDB.ts`
  - Reused `getExhibits(...)` for candidate matching
  - Reused `updateEntry(...)` for sold updates
- `src/lib/server/squareOrderChecker.ts`
  - Used via `SquareOrderChecker.getOrderSummaryByDateRange(...)`
- `src/lib/server/logger.ts`
  - Used for structured logging in preview and update actions

### Not yet updated

- `src/lib/components/admin-menu.svelte` (Sales link not yet added)
- `src/lib/zod-schemas.ts` (no sales-specific schema wiring yet; parsing is manual in actions)

---

## Phased Delivery Status

## Phase 1 — Route contract and skeleton ✅

**Objective:** Establish route and action contract with no DB writes.

### Implemented

- `load` returns route contract and defaults
- Route actions scaffolded and active (`preview`, `updateSold`)
- Sales page UI scaffolded with filter controls and preview rendering

### Current outcome

- `/admin/sales` loads successfully
- Quick range and custom controls render
- Submitting filter performs live preview (with placeholder used as fallback on validation/error)

---

## Phase 2 — Square read integration ✅

**Objective:** Pull real order data for chosen date range.

### Implemented

- Filter inputs posted to `preview` action
- Uses `SquareOrderChecker.getOrderSummaryByDateRange(start, end)`
- Date validation and API failure handling return user-visible errors via `fail(...)`
- Structured logs added for fetch start/fail/completion

### Current outcome

- For valid ranges, order rows and summaries are displayed
- Invalid range or Square failure surfaces actionable errors
- Logs include read operation context and summary counts

---

## Phase 3 — SKU parsing and classification ✅

**Objective:** Parse SKU and classify each line item before matching.

### Implemented

- Parser implemented with regex `^(\d{3})\s-\s(.+)\s-\s(\d+)$`
- Exact `Not Art` rows are ignored from matching/update
- Classifications shown in UI tables:
  - `parsedValid`
  - `invalidSku`
  - `ignoredNotArt`
  - plus downstream `canceled`, `matched`, `alreadySold`, `unmatched`, `ambiguous`

### Current outcome

- Counters and categorized tables render from server preview payload
- `Not Art` rows are ignored and excluded from updates
- Invalid SKU rows include reason text

---

## Phase 4 — Entry matching preview ✅

**Objective:** Match parsed items to exhibition entries and show a safe preview.

### Implemented

- Retrieves candidate entries via `getExhibits(...)`
- Matching currently uses `entryId + exhibitNumber + normalized artist + price`
- Classifies outcomes:
  - `matched`
  - `alreadySold`
  - `unmatched`
  - `ambiguous`
  - `canceled` (excluded)
- Grouped tables and summary counters are displayed in UI

### Current outcome

- Matched rows are selectable
- Unmatched/ambiguous rows are non-selectable with reasons
- Already sold rows are visible and excluded from updates
- Canceled rows are visible and excluded from updates

---

## Phase 5 — Controlled sold updates ✅

**Objective:** Update `entryTable.sold = true` for selected matched rows.

### Implemented

- `updateSold` action accepts selected entry IDs
- Revalidates by re-fetching Square rows and rebuilding match set before writes
- Applies idempotent `updateEntry(entryId, { sold: true })`
- Returns summary (`requested`, `updated`, `alreadySold`, `notEligible`, `failed`) and refreshed preview when updates occur
- Logs update start/completion and failure paths

### Current outcome

- Selecting matched rows updates `sold = true`
- Re-running update on same rows reports already sold (no harmful effect)
- Result summary includes updated/already-sold/not-eligible/failed counts

---

## Phase 6 — UX polish + admin navigation ✅

**Objective:** Make the workflow operationally smooth.

### Implemented

- Added Sales entry to admin menu
- Added loading/submit feedback for preview and sold update actions
- Added empty-state guidance before/after preview where applicable
- Added confirmation prompt before sold update submission
- Kept explicit visual treatment for excluded/diagnostic buckets (canceled, invalid, unmatched, etc.)

### Current outcome

- Sales page is discoverable from admin menu
- End-to-end flow works: choose range → review results → update sold flags
- UX is clear for both successful and partial-failure runs

---

## Manual Verification Checklist (No Automated Tests)

- [x] Route available at `/admin/sales` and admin-only access enforced
- [x] Quick ranges (2/7/10 days) return expected order windows
- [x] Custom date range fetch works and validates start/end
- [x] SKU parsing correctly interprets `nnn - xxxxxxx - iiii`
- [x] SKU `Not Art` always ignored
- [x] Matching requires entry id + exhibit number + normalized artist + price alignment
- [x] Ambiguous and unmatched records never become update candidates
- [x] Sold update action sets `sold = true` only
- [x] Re-running updates is idempotent
- [x] Errors are user-visible and key operations are logged with context
- [x] Admin menu includes Sales link
- [x] Update flow has a user confirmation dialog

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
