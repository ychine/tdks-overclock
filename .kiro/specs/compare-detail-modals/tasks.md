# Tasks: Compare screen detail modals

Run from `frontend/` unless noted. After each phase: `npm run lint`, `npm run build`, `npm run check:i18n`, `npm test`. No `git commit` or `git push`.

## Phase 1 (must)

- [x] 1. Calculators and money formatting (R3, R4, R5)
  - [x] 1.1 Create `src/lib/compare/money.js`: `formatPeso`, `formatRate`, `formatPercent`, `formatSigned`. Relative imports only.
  - [x] 1.2 Create `src/lib/compare/calc.js`: `payBreakdown`, `takeHomeChange`, `paydayAmounts`, `workDaysPerMonth`, `monthlyHours`, `effectiveHourly`, `sameWorkloadPay`, `restHours`, `penaltyVsPay`, `depositVsPay`, `loanDeductionCap`, `yearlyLoad`. Reuse `computeDeductions` from `../payroll.js`.
  - [x] 1.3 Add `"test": "node --test"` to `package.json`.
  - [x] 1.4 Write `money.test.js` and `calc.test.js`: every value in R3.3, formatter cases, edge cases (0, negative, NaN, missing rest, midnight window, 0 hours).
  - [x] 1.5 Run `npm test`; fix until green.

- [x] 2. Terms, fixture and `buildComparison` (R1, R2)
  - [x] 2.1 Create `terms.js` (JSDoc typedefs for `ContractTerms`, `ComparisonItem`), with `null` meaning "Not stated" and the definitions of Added, Removed, Changed, Unchanged, Not stated in comments.
  - [x] 2.2 Create `sample.js`: OLD and NEW fixture from the brief's table, plus verbatim quotes with section and page. `extraPay` NEW is `{kind:'none'}`.
  - [x] 2.3 Create `buildComparison.js`: `statusOf`, per-row status and impact rules, priority table, `numbers`, `clauses`, `biggestChange`. `legalRefIds` is `[]`.
  - [x] 2.4 Write `buildComparison.test.js`: sample statuses, impacts and priorities; Medical `unchanged` ≠ `added`; equal contracts; empty benefits; missing fields; `biggestChange` is penalty; no `6000` value in any `numbers`.
  - [x] 2.5 Run `npm test`; fix until green.

- [x] 3. Sheet infrastructure (R11)
  - [x] 3.1 Create `src/components/ui/useDialogA11y.js`: focus in, focus trap, Escape, scroll lock, focus return.
  - [x] 3.2 Add the `minus` icon to `src/components/Icon.jsx`.
  - [x] 3.3 Update `Sheet.jsx`: `max-h-[88dvh]` flex column, drag region with `useDragControls` and `dragListener={false}`, optional `header` prop, scroll area, close button stops pointer propagation, use the hook. Keep the old spacing when no `header` is passed.
  - [x] 3.4 Read `Summary.jsx`'s glossary sheet against the new structure and confirm it is unchanged in props and layout. Do not edit `Summary.jsx`.

- [ ] 4. i18n copy (R12)
  - [x] 4.1 Add `compare.*` keys to `taglish.js` (base), `english.js` and `filipino.js`: sample notice, status, impact, legend, hint, help definitions, biggest-change and summary lines, `compare.detail.common.*`, `compare.detail.<id>.*` for pay, rest, medical, penalty, benefits. Numbers are `{placeholders}` only.
  - [x] 4.2 Remove or replace the old keys that are no longer used. (Done in task 6, when `Compare.jsx` was rewritten.)
  - [x] 4.3 Add the new dynamic keys to the `dynamic` list in `scripts/check-i18n.mjs`.
  - [x] 4.4 Mark Filipino and Taglish blocks "needs native-speaker review"; record any English-in-Filipino keys for the STOP report.
  - [ ] 4.5 Run `npm run check:i18n`; fix until it passes. (All Compare keys pass. 13 `consent.*` keys used by the committed `Consent.jsx` are undefined at HEAD; not part of this feature. Waiting on your decision.)

- [x] 5. `CompareDetailSheet` and row blocks (R9, R10)
  - [x] 5.1 Create `src/components/compare/blocks.jsx`: `CellValue`, `PayBlock`, `RestBlock`, `MedicalBlock`, `PenaltyBlock`, `BenefitsBlock`.
  - [x] 5.2 Create `src/components/CompareDetailSheet.jsx` with the fixed section order, impact and status badges, old vs new grid, questions, verbatim quotes with Section and Page, footer with disclaimer, DOLE and PAO links, Close.
  - [x] 5.3 Check every requirement in R10 against the rendered content: overtime text, ₱5,000 and ₱1,000 as separate items, no ₱6,000, 24 → 9 hours, no legal note on Day off, Medical never says "added".

- [x] 6. Compare screen (R6, R7, R8)
  - [x] 6.1 Rewrite the table in `src/pages/Compare.jsx` from `buildComparison(OLD, NEW)`, with a real `<button>` per row, impact colour + icon + word, status chip, hint, legend.
  - [x] 6.2 Add the non-dismissible sample notice.
  - [x] 6.3 Add the data-driven "Biggest change" callout.
  - [x] 6.4 Add the Level 3 summary lists, disclaimer and agency links.
  - [x] 6.5 Wire `openId` state and keep the last item for the exit animation.
  - [x] 6.6 Search `Compare.jsx` for `₱` and digits to confirm no hardcoded peso values remain.

- [ ] 7. Accessibility and responsive pass (R13)
  - [ ] 7.1 Review roles, labels, tap sizes, `break-words` and `min-w-0` for long Taglish strings.
  - [ ] 7.2 Try `scripts/_shot.mjs` at 390×700 and 1440 if it runs; otherwise note it as not verified.

- [ ] 8. Phase 1 checkpoint
  - [ ] 8.1 Run `npm run lint`, `npm run build`, `npm run check:i18n`, `npm test`; fix all failures.
  - [ ] 8.2 Report Phase 1 and stop for your review.

## Phase 2 (should)

- [ ] 9. Legal endpoint (R15)
  - [ ] 9.1 Create `backend/src/routes/legal.js` (`GET /refs?ids=`), using `verifiedRefs`; cap ids at 10; return `[{id,label,quote}]`; silent on unknown ids.
  - [ ] 9.2 Mount it in `backend/server.js` at `/api/legal`.
  - [ ] 9.3 Check it with a request (`node`/`curl`) for a verified id, an unverified id (`RA10361-S21`) and a junk id.
  - [ ] 9.4 Create `frontend/src/api/legal.js` (`getLegalRefs`, returns `[]` on any error).

- [ ] 10. Legal notes in the sheet (R15)
  - [ ] 10.1 Set `legalRefIds` in `buildComparison` for pay, penalty and medical; `[]` for rest. Add a test that rest never has `RA10361-S20` or `S21`.
  - [ ] 10.2 Render "The rules say" in `CompareDetailSheet` only when refs return, with the pointing sentence from i18n. Add the "20% of ₱7,500 = ₱1,500" example labelled *example* for Pay.
  - [ ] 10.3 Add i18n keys (all three languages) and run `npm run check:i18n`.

- [ ] 11. Extra rows (R16)
  - [ ] 11.1 Add `hours` and `term` items to `buildComparison`; update priorities and their tests.
  - [ ] 11.2 Move the hours and extra-pay block out of `PayBlock`, add a link from Pay to the Hours sheet.
  - [ ] 11.3 Add i18n for both rows and the table/summary lines.

- [ ] 12. Phase 2 checkpoint
  - [ ] 12.1 Run `npm run lint`, `npm run build`, `npm run check:i18n`, `npm test`; fix all failures.

## Finish

- [ ] 13. Write the "Explain it to me" section (5 design decisions, 2 riskiest places, 3 quiz questions without answers) and the STOP report (files, commands and results, deviations, untranslated keys, open questions, what could not be verified).
