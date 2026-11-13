# Requirements: Compare screen detail modals

Scope: `frontend/` (React 19, JS/JSX, Tailwind v4, `motion`) and, in Phase 2 only, `backend/` (Express, JS).
Steering files `tech.md` and `structure.md` are out of date and are not followed.

## Glossary

- **Item**: one row on the Compare screen, described by a `ComparisonItem`.
- **Status**: what happened between contracts. One of `added`, `removed`, `changed`, `unchanged`.
- **Impact**: whether it is good or bad for the worker. One of `better`, `worse`, `watch`, `same`.
- **Not stated**: a display value meaning "not found in this document". It is not a status and does not mean "no".
- **Sample**: the fixture built from `linaw-compare-OLD-2026.pdf` and `linaw-compare-NEW-2027.pdf`.
- **Detail sheet**: the bottom sheet opened from a row.

## Phase 1 (must)

### R1. Comparison data model
1. THE SYSTEM SHALL define `ContractTerms` and `ComparisonItem` as JSDoc typedefs in `frontend/src/lib/compare/terms.js`. No TypeScript.
2. THE SYSTEM SHALL provide the sample fixture (OLD and NEW `ContractTerms`) in `frontend/src/lib/compare/sample.js`, with the values from the fixture table in the brief.
3. THE SYSTEM SHALL store the contract quotes verbatim, with section and page, as data. They SHALL NOT be translated or paraphrased.
4. THE SYSTEM SHALL represent "Pay beyond agreed hours: none, all overtime included" as an explicit value (`extraPay.kind = 'none'`), distinct from a missing field.

### R2. `buildComparison(oldTerms, newTerms)`
1. THE SYSTEM SHALL implement it as a pure function with no React and no network, in `frontend/src/lib/compare/buildComparison.js`.
2. WHEN a fact is in the new contract only, THE SYSTEM SHALL set status `added`.
3. WHEN a fact is in the old contract only, THE SYSTEM SHALL set status `removed`.
4. WHEN a fact is in both with different values, THE SYSTEM SHALL set status `changed`.
5. WHEN a fact is identical in both, THE SYSTEM SHALL set status `unchanged` and impact `same`.
6. THE SYSTEM SHALL derive impact by these rules:
   - weekly rest hours decrease → `worse`;
   - a new money obligation on the worker (penalty, deposit, deduction rule) → `worse`;
   - a new benefit with no downside → `better`;
   - gross salary up and effective hourly pay down → `watch`;
   - identical → `same`.
7. FOR the sample, THE SYSTEM SHALL produce: pay = changed/watch, rest = changed/worse, medical = unchanged/same, penalty = added/worse, benefits = added/better. Priorities SHALL be penalty 1, rest 2, pay 3, benefits 4, medical 5.
8. THE SYSTEM SHALL document the definitions of Added, Removed, Changed, Unchanged and Not stated in code comments and in user-facing help copy.
9. THE SYSTEM SHALL derive the "Biggest change" callout as the item with impact `worse` and the lowest `priority`. IF no item is `worse`, THE SYSTEM SHALL omit the callout.

### R3. Deterministic calculators (`frontend/src/lib/compare/calc.js`)
1. THE SYSTEM SHALL compute every number shown in a sheet in pure functions, reusing `computeDeductions` from `lib/payroll.js`. No money math in JSX or in an LLM.
2. THE SYSTEM SHALL implement `payBreakdown`, `takeHomeChange`, `paydayAmounts`, `monthlyHours`, `effectiveHourly`, `sameWorkloadPay`, `restHours`, `penaltyVsPay`, `depositVsPay`, `loanDeductionCap` and `yearlyLoad`.
3. FOR the sample, THE SYSTEM SHALL return:
   - take-home 5,795 → 6,725, change +930, contributions +70;
   - paydays ≈ 2,897.50 × 2 (old) and 6,725 × 1 (new);
   - 208 → 260 hours a month (26 work days);
   - hourly 31.25 → 28.85;
   - same-workload pay 8,840, which is 1,340 more than the new 7,500;
   - rest 24 → 9 hours, 15 fewer, with the 9 computed from 08:00→17:00;
   - penalty 67% and deposit 13% of the new salary;
   - 20% loan cap 1,500;
   - yearly load 3,600.
4. THE SYSTEM SHALL round only at display time.
5. THE SYSTEM SHALL NOT sum the early-leaving penalty and the deposit anywhere.
6. IF salary is 0 or a field is missing, THEN calculators SHALL return safe zero or "Not stated" results and SHALL NOT throw or return `NaN`.

### R4. Money formatting
1. THE SYSTEM SHALL add a formatter that prints whole values without decimals (`₱5,000`) and non-whole values with exactly 2 decimals (`₱2,897.50`).
2. THE SYSTEM SHALL format hourly rates with 2 decimals (`₱28.85`).
3. `peso()` in `lib/contract.js` SHALL keep its current behaviour for other screens.

### R5. Tests
1. THE SYSTEM SHALL add `"test": "node --test"` to `frontend/package.json` and add no dependency.
2. Files under `lib/compare/` SHALL use relative imports only, so they run under plain Node without the `@/` alias.
3. THE tests SHALL cover:
   - every value in R3.3;
   - statuses and impacts for the sample;
   - Medical `unchanged` ≠ `added`;
   - the formatter (`2897.5` → `₱2,897.50`);
   - edge cases: salary 0, missing field, equal contracts (all `unchanged/same`), empty benefits.

### R6. Table (Level 1) in `Compare.jsx`
1. THE SYSTEM SHALL render rows from `buildComparison(...)`: Pay, Day off, Medical, Penalty, Other benefits. `Compare.jsx` SHALL contain no hardcoded peso values or demo numbers.
2. THE SYSTEM SHALL convey impact by colour, icon and word (`better` ✓, `worse` ⚠, `watch` ↻, `same` —), and status by a separate text chip.
3. THE SYSTEM SHALL use red only for `worse`, and yellow only as a fill with ink text.
4. THE SYSTEM SHALL update the legend to describe both status and impact.
5. THE SYSTEM SHALL put a real `<button>` (label + chevron, at least 48px tall) in each row-header cell. `onClick` SHALL NOT be only on `<tr>`.
6. THE SYSTEM SHALL show the hint "Tap a row to see the details." above the table.
7. THE SYSTEM SHALL render the data-driven "Biggest change" callout from R2.9.

### R7. Overall summary (Level 3)
1. THE SYSTEM SHALL replace the bottom panel with two lists: "Better for you" (impact `better`) and "Check before you sign" (impact `worse` or `watch`).
2. EACH line SHALL be a short i18n sentence per item, with numbers from the calculators. No LLM text.
3. THE SYSTEM SHALL keep the disclaimer (`app.disclaimer`) and the agency links (`lib/agencies.js`) visible on this screen.

### R8. Sample notice (critical)
1. WHEN the sample is displayed, THE SYSTEM SHALL show a visible notice: "This is a sample comparison. Linaw is not reading your uploaded files here yet."
2. THE notice SHALL NOT be dismissible or hidden.
3. Uploaded files SHALL remain used only for their file name, as today.

### R9. Detail sheet (Level 2)
1. THE SYSTEM SHALL provide one reusable `CompareDetailSheet` driven by a `ComparisonItem`.
2. WHEN a row button is activated (click, tap, Enter, Space), THE SYSTEM SHALL open that row's sheet.
3. THE sheet SHALL show these sections in this order:
   1. title, status chip, impact chip (icon + text);
   2. old vs new (side by side at 640px and wider, stacked below that; value in Fraunces tabular numerals);
   3. What changed (1–3 short sentences);
   4. What it means for you (1–3 short sentences);
   5. row-specific block;
   6. Ask before you sign (2–4 questions);
   7. Where it is in the contract (`Section · Page` + verbatim quote);
   8. footer with the disclaimer, DOLE and PAO links, and a Close button.
4. EVERY fact stated in a sheet SHALL show Section, Page and verbatim quote.
5. EVERY estimate SHALL be labelled "estimate" and show its assumptions ("Assumes 6 work days a week, since Sunday is the rest day · 26 work days a month").
6. Deduction figures SHALL carry: "Based on current SSS/PhilHealth/Pag-IBIG rates — your pay slip is the final word".
7. THE sheet SHALL use no nested cards, no eyebrow above headings, no side-stripe callouts, body text of at least 16px, tap targets of at least 48px. It SHALL hold up at 390px and 1440px with long Taglish strings.
8. Linaw's own voice SHALL NOT say "illegal" or "unlawful", and SHALL NOT use "clause", "provision", "liquidated" or "remuneration".

### R10. Row content
1. **Pay** (`watch`):
   - salary 6,500 → 7,500 (+1,000, about 15%) and payday change;
   - estimate table of salary, SSS, PhilHealth, Pag-IBIG, total deductions, take-home, old and new;
   - the "+₱930, not ₱1,000" line and the per-payday line;
   - the hours and extra-pay block: 8 → 10 hours; ₱45 per hour → "None. All overtime is included in the monthly wage."; 208 → 260 h; ₱31.25 → ₱28.85; same-workload ₱8,840 vs ₱7,500;
   - the new cash-advance deduction rule (Sec 8);
   - questions about extra hours, cash advance in parts, and the pay slip.
2. **Day off** (`worse`): 24 → 9 hours, "15 fewer hours". THE copy SHALL NOT claim the worker will be required to work. THE sheet SHALL cite no legal reference and state no legal minimum.
3. **Medical** (`unchanged`/`same`):
   - "First-aid assistance in case of illness" in both;
   - "Nothing changed here.";
   - a list of 5 items each marked "Not stated" (insurance or health coverage; doctor visits; medicine; hospital; expenses beyond first aid);
   - THE sheet SHALL NOT say "added" or "covered now".
4. **Penalty** (`worse`):
   - Part A, leaving early: Not stated → ₱5,000 (about two-thirds of one month), Sec 15 p.2;
   - Part B, deposit: none → ₱1,000 on signing, Sec 11 p.2, cited under "Loan agreement";
   - THE two parts SHALL be separate items with "when it applies" each, and NO combined total (₱6,000) SHALL appear anywhere;
   - context lines computed from data: the 2-year term ending Jan 4, 2029, and the 5 days' written notice in Sec 13;
   - a "not stated" list of 4 items about the deposit;
   - questions for Part A and Part B.
5. **Other benefits** (`added`/`better`): "Still the same" (leave, 13th month, meals, private room) vs "New" (₱300 load ≈ ₱3,600 a year, 1 birthday day off); questions about the load and the birthday leave.

### R11. Sheet infrastructure (`components/ui/Sheet.jsx`)
1. THE sheet panel SHALL have a max height of about 88dvh, a flex column layout, a content area with `overflow-y-auto overscroll-contain`, and safe-area bottom padding.
2. Drag-to-dismiss SHALL start only from the handle/header, via `useDragControls`. Scrolling content SHALL NOT close the sheet.
3. WHEN the sheet opens, focus SHALL move inside it. WHEN it closes (Escape, backdrop, Close, drag from handle), focus SHALL return to the element that opened it.
4. WHILE the sheet is open, Tab and Shift+Tab SHALL stay inside it, and background scroll SHALL be locked.
5. THE sheet SHALL have `role="dialog"`, `aria-modal="true"` and a labelled title.
6. THE glossary sheet in `Summary.jsx` SHALL behave as before, with the same props and visuals for short content.

### R12. i18n
1. EVERY user-facing string SHALL be behind an i18n key (`compare.detail.<id>.*` for sheet copy), with `{placeholders}` for numbers. No peso figure inside a translated sentence SHALL be typed by hand.
2. English and Taglish SHALL be complete. `npm run check:i18n` SHALL pass; Taglish is the base file the checker compares against.
3. IF Filipino copy is incomplete, THEN missing keys SHALL carry English text and be listed in the STOP report.
4. Filipino and Taglish copy SHALL be flagged as needing native-speaker review.
5. Copy SHALL use short sentences (under about 20 words), a kind and plain voice, and phrases such as "what you take home" and "extra hours".

### R13. Accessibility
1. Status and impact SHALL each be conveyed by icon and text, never by colour alone.
2. Keyboard-only use SHALL reach every row, open and close every sheet, and reach the footer links.
3. A long sheet SHALL scroll inside itself at 390×700 without closing.

### R14. Constraints
1. No new dependencies. No edits to `backend/src/legal/*.json`. No TypeScript files. No other screens changed.
2. No `git commit` or `git push`.
3. `npm run check:i18n`, `npm run lint`, `npm run build` and `npm test` SHALL pass in `frontend/`.

## Phase 2 (should)

### R15. Legal notes ("The rules say")
1. THE backend SHALL expose `GET /api/legal/refs?ids=A,B` in a new `backend/src/routes/legal.js`, mounted in `server.js`.
2. THE endpoint SHALL return only `{ id, label, quote }` for entries in `verifiedRefs` with `verified === true` and a non-empty quote. Unknown or unverified ids SHALL be omitted silently.
3. THE frontend SHALL call it via a new `frontend/src/api/legal.js`.
4. THE sheet SHALL show a legal note only if the ref was returned. IF the call fails or returns nothing, THEN the sheet SHALL render normally with no spinner and no error banner.
5. Mapping SHALL be:
   - Pay → `IRR-IV-11`, `IRR-V-2`, plus the labelled example "20% of ₱7,500 = ₱1,500";
   - Penalty (leaving) → `IRR-VII-2`;
   - Penalty (deposit) → `IRR-V-6-7`;
   - Medical → `IRR-IV-12-13`;
   - Day off → none (`RA10361-S20` and `S21` are unverified and SHALL NEVER be cited).
6. EACH note SHALL show "The rules say:" + `label` + the verbatim `quote`, then one Linaw sentence that points to DOLE or the barangay and does not conclude.
7. Legal text SHALL NOT be copied into the frontend.

### R16. Extra rows
1. THE SYSTEM SHALL add **Hours & overtime** (`changed`/`worse`, priority 2; the others shift down by one). The hours and extra-pay block SHALL move out of Pay, and Pay SHALL link to it.
2. THE SYSTEM SHALL add **Contract length** (`changed`/`watch`: 1 → 2 years; the auto-renewal clause is unchanged; it interacts with the penalty).

## Phase 3 (not built now)
Real extraction of two uploaded contracts into `ContractTerms`. Only the seam (`buildComparison` input) is kept clean.

## Out of scope
Real two-document extraction · LLM explanations · editing legal JSON · repo restructuring · new UI libraries · changes to other screens · any "net salary" the contract itself does not support.

## Notes and open points from checking the code
- `frontend/package.json` has no `test` script and no test files today. `node --test` run in `frontend/` will pick up any `*.test.js` under it. This is fine, but the compare tests must use relative imports (R5.2).
- In `ra10361.json`, `RA10361-S20` is "Daily Rest Period" and `S21` is "Weekly Rest Period". Neither is cited (R10.2, R15.5).
- The sample's priorities (R2.7) change when Phase 2 adds Hours & overtime (R16.1). Phase 1 tests will assert the Phase 1 values.
