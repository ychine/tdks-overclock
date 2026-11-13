# Design: Compare screen detail modals

Implements `requirements.md` (R1–R16). All paths are relative to the repo root.

## 1. Facts from the code that shape the design

- `t(key, vars)` (in `I18nProvider.jsx`) replaces `{name}` placeholders, returns arrays as they are, and falls back to Taglish when a key is missing. `check-i18n.mjs` compares every key, array length, `{placeholders}` and `**` count against Taglish.
- `check-i18n.mjs` only checks literal `t('a.b')` calls plus a hand-kept `dynamic` list. Keys built as `` t(`compare.detail.${id}.x`) `` are not seen, so I add those keys to the `dynamic` list. This is a small edit to a script, not to product code.
- `Icon` already has `chevron`, `check`, `alert`, `refresh`, `plus`, `close`, `arrow`. There is no "minus" or "same" icon. I add one (`minus`) to `Icon.jsx`. This is the only edit to that file.
- `Surfaces.jsx` already provides `Callout`, `Badge`, `ListGroup`, `ListRow`, `IconTile`, `Panel`. I reuse them. No new surface primitives.
- `payroll.js` and `contract.js` have no imports that need the `@/` alias (`contract.js` uses `./payroll`). The `lib/compare/` files use relative imports only, so `node --test` runs them.
- Lenis (smooth scroll) is only created on the Landing page, so a body scroll lock on Compare is not fought by it.
- `backend` is ESM (`import`). The legal refs come from `verifiedRefs` in `services/legalRefs.js`, which already filters `verified === true` with a non-empty quote.

## 2. Architecture

```
lib/compare/                  pure JS, no React, relative imports only
  terms.js        JSDoc typedefs
  sample.js       OLD/NEW ContractTerms fixture + verbatim clause quotes
  calc.js         deterministic calculators
  money.js        formatPeso / formatRate (display only)
  buildComparison.js   (oldTerms, newTerms) -> ComparisonItem[]
  *.test.js       node:test
components/
  CompareDetailSheet.jsx   one component, driven by a ComparisonItem
  compare/blocks.jsx       small row-specific blocks (PayBlock, RestBlock, ...)
  ui/Sheet.jsx             extended (header slot, scroll, drag from header, focus)
  ui/useDialogA11y.js      focus trap + focus return + scroll lock hook
pages/Compare.jsx          table, legend, callout, summary, sample notice
i18n/{taglish,english,filipino}.js   compare.* keys
```

Data flow:

```
sample.js (OLD, NEW) -> buildComparison -> items[] -> Compare.jsx (table, callout, summary)
                                                   -> CompareDetailSheet (one item at a time)
calc.js numbers are computed inside buildComparison and stored on item.numbers;
JSX never calls a calculator, it only formats item.numbers with money.js.
```

Phase 3 seam: replace `sample.js` with an extractor that returns two `ContractTerms`. `buildComparison` and the UI do not change.

## 3. Data model

### 3.1 `ContractTerms` (R1)

As in the brief, plus these fields:

- `clauses` is a map from a fact key to `{ section, page, quote }`. Keys: `wage`, `payday`, `hours`, `extraPay`, `rest`, `deductions`, `leave`, `medical`, `benefits`, `deposit`, `notice`, `earlyLeave`, `term`.
- A fact that is absent is `null`, not `0` or `''`. Examples: `earlyLeavePenalty: null` and `deposit: null` mean "Not stated"; `0` is not used. This keeps "Not stated" distinct from "no" (R2). The brief says "0 if none"; I use `null` for "not in this document" and reserve `0` for a stated zero. The fixture's OLD contract therefore has `deposit: null` and `earlyLeavePenalty: null`.
- `extraPay` is `{kind:'perHour',amount}` or `{kind:'none'}` (stated). A missing `extraPay` is `null` ("Not stated").
- `noticeDays` (5 in both) is added, so the Penalty context line is computed from data.

### 3.2 `ComparisonItem` (R2)

```js
{
  id, status, impact, priority,
  old, new,        // table-cell values: { kind: 'money'|'hours'|'text'|'notStated'|'none', value }
  numbers,         // per-item computed figures (see 4.2)
  clauses,         // [{ section, page, oldQuote?, newQuote? }]
  legalRefIds,     // [] in Phase 1
}
```

Table-cell values are structured, not strings. `Compare.jsx` turns them into text with `t()` and `money.js`. This keeps peso figures and translation out of the logic layer.

### 3.3 Status rule

One helper `statusOf(oldVal, newVal, equal)`:

| old | new | status |
|---|---|---|
| null | not null | `added` |
| not null | null | `removed` |
| not null | not null, `equal` false | `changed` |
| equal | equal | `unchanged` |
| null | null | `unchanged` |

Each row supplies its own `equal` and its own fact(s):

- `pay` compares `salary` and `paydays`.
- `rest` compares rest hours.
- `medical` compares `medical.firstAid`.
- `penalty` compares `earlyLeavePenalty` and `deposit`. It is `added` if either is newly present, `changed` if both exist and differ.
- `benefits` compares the benefits object. In the sample the old and new both exist and the new adds two items. The brief expects `added`, so for `benefits` the rule is: if the new contract has at least one benefit the old lacks and loses none → `added`; if any benefit is lost or its value changes → `changed`; same → `unchanged`.

### 3.4 Impact rules (R2.6), evaluated per row in this order

- `rest`: new hours < old hours → `worse`; equal → `same`; greater → `better`.
- `penalty`: any new penalty or deposit → `worse`; any removed → `better`; same → `same`.
- `pay`: if status is `unchanged` → `same`. Else if salary up and effective hourly pay down → `watch`. Salary up and hourly not down → `better`. Salary down → `worse`. A new cash-advance rule alone, with no salary change, → `worse`.
- `benefits`: new benefits and none lost → `better`; any lost → `worse`; same → `same`.
- `medical`: identical → `same`; new `firstAid` → `better`; lost → `worse`.

Priority is a constant table in `buildComparison.js`: `{ penalty:1, rest:2, pay:3, benefits:4, medical:5 }`. The "Biggest change" function `biggestChange(items)` filters `impact === 'worse'` and takes the lowest `priority`. It returns `null` if there is none.

## 4. Calculators (`calc.js`) and formatting (`money.js`)

### 4.1 Rules

- All functions are pure, take numbers or plain objects, and never return `NaN`. Bad input (undefined, negative, NaN) → `0` or `null` for "unknown".
- Money is kept as pesos with at most 2 decimals. Intermediate values are not rounded. `payBreakdown` passes through `computeDeductions`, which already rounds to centavos.
- Rounding happens only in `money.js`.

### 4.2 Functions

| Function | Notes |
|---|---|
| `payBreakdown(salary)` | `{ salary, sss, philhealth, pagibig, total, net }` from `computeDeductions` |
| `takeHomeChange(oldSalary, newSalary)` | `{ gross, contributions, net }` as new − old |
| `paydayAmounts(net, paydays)` | `{ count, each }`; `each = net / paydays.length` |
| `workDaysPerMonth(perWeek = 6)` | `perWeek * 52 / 12` = 26 |
| `monthlyHours(hoursPerDay, perWeek = 6)` | 208 / 260 |
| `effectiveHourly(salary, hours)` | `hours > 0 ? salary / hours : null` |
| `sameWorkloadPay(oldTerms, hoursPerDay, perWeek = 6)` | uses old `salary`, old `hoursPerDay`, old `extraPay`; returns `null` if old has no per-hour rate |
| `restHours(rest)` | `wholeDay` → 24; `window` → minutes from `from`/`to` ÷ 60. A window that crosses midnight (to ≤ from) adds 24h |
| `penaltyVsPay(amount, salary)` | `salary > 0 ? amount / salary : null` |
| `depositVsPay(amount, salary)` | same |
| `loanDeductionCap(salary)` | `salary * 0.2` |
| `yearlyLoad(monthly)` | `monthly * 12` |

`sameWorkloadPay` follows the brief: `salary + workDays × max(0, hoursPerDay − oldHoursPerDay) × rate`. For the sample it is 6,500 + 26 × 2 × 45 = 8,840. The difference from the new 7,500 (1,340) is computed in `buildComparison`, not in JSX.

### 4.3 `money.js`

- `formatPeso(n)` → `₱5,000` for whole values and `₱2,897.50` for others. It uses `toLocaleString('en-PH', { minimumFractionDigits: 0|2, maximumFractionDigits: 2 })`. A whole check uses `Math.abs(n - Math.round(n)) < 0.005`, so `2897.5` gives 2 decimals and `5000.001` gives none.
- `formatRate(n)` → always 2 decimals (`₱28.85`).
- `formatPercent(ratio)` → whole percent (`67%`).
- Negative values print as `−₱930`. `formatSigned(n)` prints `+₱930` / `−₱930`.
- `null` or `NaN` → `''`. Callers decide what to show instead (the i18n "Not stated").

`lib/contract.js:peso` is untouched.

## 5. Comparison builder (`buildComparison.js`)

`buildComparison(oldTerms, newTerms)` returns the five items in the fixed order `pay, rest, medical, penalty, benefits` (table order). It does not sort by priority; the callout and the summary choose by priority themselves.

Per item, `numbers` holds:

- `pay`: `oldBreakdown`, `newBreakdown`, `takeHome` (from `takeHomeChange`), `oldPayday`, `newPayday`, `oldMonthlyHours`, `newMonthlyHours`, `hoursChangePct`, `oldHourly`, `newHourly`, `hourlyChangePct`, `sameWorkload`, `sameWorkloadGap`, `grossChangePct`, `assumptions: { perWeek, workDays }`.
- `rest`: `oldHours`, `newHours`, `diffHours`.
- `medical`: `{}`.
- `penalty`: `earlyPenalty`, `earlyVsPay`, `deposit`, `depositVsPay`, `termYears`, `termEnd`, `noticeDays`.
- `benefits`: `same` (list of benefit keys), `added` (list), `loadYearly`.

Equal-contracts case: every item is `unchanged/same`. Missing fields produce `null` values and a "Not stated" `old`/`new` cell, never an exception.

Phase 2 adds `hours` and `term` items to this function and adjusts the priority table. Phase 1 tests assert Phase 1 priorities; the Phase 2 task updates them.

## 6. Sheet infrastructure (R11)

### 6.1 `Sheet.jsx` changes

New optional props, all backwards compatible: `header` (node). Existing props stay the same. `Summary.jsx` is not edited.

Structure:

```
<motion.div role=dialog aria-modal aria-labelledby=titleId
            drag="y" dragListener={false} dragControls={controls}
            className="flex max-h-[88dvh] flex-col ...">
  <div data-drag-handle onPointerDown={e => controls.start(e)} className="touch-none ...">
    handle bar  +  {header}  +  close button
  </div>
  <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-... pb-[max(24px,env(safe-area-inset-bottom))]">
    {children}
  </div>
</motion.div>
```

- Drag starts only from the handle/header region via `useDragControls` with `dragListener={false}`. The scroll area has no pointer handler, so scrolling cannot dismiss the sheet. The existing drag constraints and the `offset.y > 90` rule are kept.
- When `header` is not given (Summary), the handle region is the same absolute strip it is now (top 32px, full width, plus the close button), and the content keeps the old `px-6 pt-8` spacing, so the glossary sheet looks and behaves the same for short content. The close button stays where it is (top-right, 48px).
- When the panel content is short there is no scrollbar, because `max-h` is only a ceiling.
- The close button is inside the drag region, so a tap on it must not start a drag: its `onPointerDown` calls `e.stopPropagation()`.

### 6.2 `useDialogA11y(open, panelRef, onClose)` (new hook)

Extracted from the `ConfirmDialog` pattern; `ConfirmDialog` itself is left untouched.

- On open: store `document.activeElement` as `previous`; move focus to the element with `data-autofocus` or, if none, the first focusable inside the panel (the close button).
- Tab / Shift+Tab: wrap between first and last focusable elements, using the same selector as `ConfirmDialog`.
- Escape: `onClose()`.
- Scroll lock: set `document.body.style.overflow = 'hidden'` on open and restore the previous value on close/unmount.
- On cleanup (close or unmount): restore body overflow and `previous.focus()` if it is still in the document.
- Sheet currently focuses the close button and listens to Escape itself. Those two bits are replaced by the hook. The behaviour is the same for Summary, plus trap, scroll lock and focus return.

Focus return works because each row button stays mounted while the sheet is open. If the sheet is closed by dragging, `onClose` runs and the same cleanup applies.

## 7. `CompareDetailSheet` (R9, R10)

Props: `item` (ComparisonItem | null), `onClose`. `Compare.jsx` holds `openId` in state and passes `items.find(...)`. The sheet is mounted once and `open = item !== null`. When closing, `AnimatePresence` needs the item during the exit animation, so `Compare.jsx` keeps the last item in a ref and passes it while `open` is false.

Layout (top to bottom), inside the `Sheet` scroll area:

1. `header` slot: `<h2 id=titleId>` (Fraunces) with status `Badge` (text) and impact `Badge` (icon + text). Impact tone map: `better` → `ok` with `check`; `worse` → `alert` with `alert`; `watch` → `sun` with `refresh`; `same` → `neutral` with `minus`. Status badges are `neutral` with a text label only (R6.2: status is a text chip).
2. Old vs New: a two-column grid at `sm:` and up (`sm:grid-cols-2`), stacked below. Each cell has a label (Figtree) and a value in `font-display tabular-nums text-3xl`. Values come from `item.old` / `item.new` rendered by a small `CellValue` component shared with the table.
3. `<h3>` What changed + paragraph(s) from i18n.
4. `<h3>` What it means for you + paragraph(s).
5. Row block from `blocks.jsx`, chosen by `item.id`.
6. `<h3>` Ask before you sign: an `<ul>` of questions from an i18n array.
7. `<h3>` Where it is in the contract: for each clause entry, `Section {n} · Page {p}` and `<blockquote>` with `oldQuote` / `newQuote`, labelled "Old" / "New". Quotes are never passed through `t()`.
8. Footer: disclaimer text (`app.disclaimer`), the DOLE and PAO links from `lib/agencies.js` using `telHref`, and a Close `Button`.

No nested cards: sections are separated by `border-t border-line` dividers, and lists use `ListGroup`/`ListRow` where rows are facts. No eyebrow above headings. No side-stripe callouts.

Phase 2 inserts "The rules say" between 7 and 8.

### Row blocks (`blocks.jsx`)

Each block is a function of `item` and `t` that returns JSX, using only `item.numbers`:

- `PayBlock`: estimate table (`<table>` with `<caption>`; old and new columns), take-home line, payday line, hours-and-extra-pay sub-block, deductions note, the estimate label and assumptions line, and the "Based on current … rates" line. The extra-pay line uses the verbatim overtime quote from `clauses`, and for `{kind:'none'}` shows the "None. All overtime is included in the monthly wage." quote, not a "not stated" text.
- `RestBlock`: the computed `diffHours` line, and the note that no legal reference is cited does not appear in the UI (nothing is rendered for it).
- `MedicalBlock`: list of five "Not stated" items (from an i18n array, each rendered with a "Not stated" `Badge`).
- `PenaltyBlock`: two sections, "Part A — Leaving early" and "Part B — Deposit". Each has its own value, "when it applies" line, share-of-pay line, clause reference, "not stated" list, and its own questions. There is no code path that adds the two amounts.
- `BenefitsBlock`: two lists, "Still the same" and "New".

The questions in sections 6 of the Penalty sheet are split by part, so the general "Ask before you sign" renders `questions` as an array of `{ part?, items }`. In i18n the Penalty key is two arrays (`ask.a`, `ask.b`).

## 8. Table, legend, callout, summary (R6, R7, R8)

`Compare.jsx`:

- State: `oldName`, `newName`, `problem`, `openId` (as today plus `openId`). `items = useMemo(() => buildComparison(OLD, NEW), [])`.
- Sample notice: `Callout tone="info"` with `icon="alert"`, always rendered when the comparison is shown. It also appears before upload? No: the comparison only shows after a "new" file is chosen (current flow), so the notice shows with it. It has no close button and no state.
- "Biggest change" `Callout` from `biggestChange(items)`: title from `t('compare.biggest.<id>.title')`, text from `t('compare.biggest.<id>.text', vars)` with vars from `item.numbers`.
- Legend: two short lists, one for impact (icon + word + colour swatch) and one for status (word only), plus a "Not stated means we did not find it in that contract. It does not mean no." note.
- Hint line "Tap a row to see the details."
- Table: same `<table>` and `<caption>`. The row header cell contains `<button type="button" className="min-h-12 w-full ...">` with label + `chevron` icon and `aria-haspopup="dialog"`. The "New" cell shows the impact icon, an `sr-only` impact word, the value, and the status chip. Cell colours come from impact: `better` → `bg-brand-soft`? The old code used `bg-brand-soft` for good and `bg-alert-soft` for bad; I keep those two and use `bg-sun/35` for `watch` and none for `same`.
- Summary (Level 3): `Panel` with two lists: "Better for you" (impact `better`) and "Check before you sign" (impact `worse`/`watch`). Each line is `t('compare.summary.<id>', vars)`. When a list is empty, a single i18n line is shown ("Nothing here."). Then the disclaimer and the agency links row (reusing `agencies`).
- The "replace new contract" button stays.

Hardcoded text removed: all peso values, `Contract_2024.pdf` stays as the old placeholder file name (it is a file name, not a peso value, and the existing flow uses it; it is not changed).

## 9. i18n plan (R12)

Key namespaces (all added to taglish, english and filipino):

- `compare.sample.*`: notice title and text.
- `compare.status.{added,removed,changed,unchanged}`, `compare.impact.{better,worse,watch,same}`, `compare.notStated`, `compare.none`.
- `compare.legend.*`, `compare.hint`, `compare.help.*` (definitions).
- `compare.row.{pay,rest,medical,penalty,benefits}`: row names. These reuse the existing `compare.rowSalary` etc. where they exist.
- `compare.biggest.<id>.{title,text}` and `compare.summary.<id>`.
- `compare.detail.<id>.{changed,means,ask,...}`: strings with `{placeholders}`.
- `compare.detail.common.*`: section titles, "Estimate", assumptions, "Based on current … rates", "Old", "New", "Section {section} · Page {page}", "Not stated".

Existing keys that become unused (`compare.alertTitle`, `alertText`, `restOld`, `restNew`, `medicalOld`, `medicalNew`, `summaryTitle`, `summaryText`, `added`, `removed`) are replaced or removed in all three files. `compare.added/changed/removed` are in the checker's `dynamic` list, so that list is updated.

Placeholders: every number is a placeholder (`{amount}`, `{hours}`, `{pct}`) filled from `item.numbers` through `money.js`. No peso symbol or digit that comes from data appears in a translation file. Digits in static copy are limited to non-data facts that are part of the sentence's meaning and are also placeholders in the brief's examples (for example "8 AM–5 PM" is a placeholder `{from}`–`{to}` built from the rest times).

Review flags: a comment at the top of the new key blocks in `taglish.js` and `filipino.js` says "needs native-speaker review". Filipino gets real translations; any key I cannot translate with confidence gets English text, and is listed in the STOP report.

## 10. Phase 2 design (R15, R16)

Backend:

- `backend/src/routes/legal.js`: `GET /refs?ids=A,B`. Parse and cap ids at 10. Filter `verifiedRefs` by id. Return `[{ id, label, quote }]` only. Unknown, unverified and malformed ids are dropped silently. Response is always `200` with an array (possibly empty).
- Mounted in `server.js` as `/api/legal`.

Frontend:

- `frontend/src/api/legal.js`: `getLegalRefs(ids)` using the same fetch/axios style as `api/chat.js`; returns `[]` on any error.
- `CompareDetailSheet` fetches on open when `item.legalRefIds.length`. State: `refs` (default `[]`). No loading UI. The section renders only when `refs.length > 0`.
- Each ref: "The rules say:" + `label` + `<blockquote>` with `quote`, then one Linaw sentence from `compare.detail.<id>.legal.<n>`.
- `legalRefIds` map in `buildComparison`: pay → `IRR-IV-11`, `IRR-V-2`; penalty → `IRR-VII-2`, `IRR-V-6-7`; medical → `IRR-IV-12-13`; rest → `[]` (a test asserts it never contains `RA10361-S20` or `S21`).
- Extra rows: `hours` (moved out of Pay: `PayBlock` loses its hours sub-block and gets a link button that opens the `hours` sheet) and `term`. Priorities become penalty 1, hours 2, rest 3, pay 4, benefits 5, term 6, medical 7 (Hours & overtime is priority 2, others shift down by one as stated; Contract length goes before Medical). Open point: the brief gives no priority for `term`; I place it at 6, above Medical. This only affects the Biggest-change choice when two items are `worse`, and `term` is `watch`, so it never wins.

## 11. Accessibility (R13)

- Row buttons are real `<button>`s with an accessible name from the row label. `aria-haspopup="dialog"`.
- The dialog has `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing at the `<h2>`.
- Impact and status each have visible text. The icon is `aria-hidden`. The impact word is also read in the table cell through `sr-only` text.
- Tap targets at least 48px (`min-h-12`). Body text at least 16px; small helper text uses `text-sm` only for secondary notes, as in the existing screens.
- Long strings: `min-w-0`, `break-words` on values and quotes. Table uses `table-fixed` as today with `break-words` cells.
- Reduced motion: Sheet already uses a spring; no new animation is added.

## 12. Testing and verification

`node --test` files in `frontend/src/lib/compare/`:

- `calc.test.js`: every number in R3.3; edge cases (salary 0, negative, NaN, missing rest, window crossing midnight, `hoursPerDay` 0).
- `money.test.js`: `2897.5` → `₱2,897.50`; `5000` → `₱5,000`; `28.846` via `formatRate` → `₱28.85`; negatives; null.
- `buildComparison.test.js`: statuses, impacts, priorities, Medical `unchanged` ≠ `added`, equal contracts, empty benefits, missing fields → "Not stated", no ₱6,000 anywhere in `numbers` (a test that walks `numbers` for 6000), `biggestChange` → penalty.

Manual and tool checks after each phase: `npm run lint`, `npm run build`, `npm run check:i18n`, `npm test` in `frontend/`. I cannot run a browser here, so the 390×700 scroll, drag-from-handle and focus-return behaviour are verified by code review and by the existing `scripts/_shot.mjs` if it works; otherwise they are listed as not verified in the STOP report.

## 13. Risks

1. **Sheet rewrite touches the glossary.** Moving content into a scroll area and splitting out the drag region could change Summary's spacing or drag feel. Mitigation: keep the old paddings when no `header` is passed, and review Summary's markup against the new structure.
2. **Pointer events on the drag handle.** `useDragControls` + `touch-none` on the header can block taps on the close button, or fail on some Android browsers. Mitigation: stop propagation on the close button and keep the drag region small.
3. **i18n volume.** About 100–150 new keys × 3 languages. The checker catches missing keys and placeholder mismatches but not wrong meaning, so Filipino and Taglish need a native-speaker review.
4. **Benefits status rule** is custom (§3.3) to match the expected `added`. If the user later wants `changed`, it is one function.

## 14. Deviations from the brief (to confirm)

1. `deposit` and `earlyLeavePenalty` are `null` when absent instead of `0` (§3.1), so "Not stated" differs from "none".
2. `Icon.jsx` gets one new `minus` icon (§1).
3. `check-i18n.mjs` gets new dynamic keys (§1). Without this the checker would not see the new keys.
4. `ConfirmDialog` is not changed; the focus-trap code is duplicated into a hook instead of shared (§6.2), to avoid touching other screens.
