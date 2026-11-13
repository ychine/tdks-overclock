# Implementation Plan

- [ ] 1. Scaffold the monorepo
  - Create `apps/web`, `apps/api`, `packages/shared`, `config`, `prompts` with npm workspaces and TypeScript project references
  - Add Vitest, ESLint, Prettier; add root scripts for build, test, lint
  - Leave legacy `/backend` and `/frontend` untouched
  - _Requirements: structure steering_

- [ ] 2. Shared types, schemas, and config loading
  - [ ] 2.1 Define `FieldKey`, `ExtractedField`, `BoundingBox`, `OcrResult`, and zod schemas in `packages/shared`
    - _Requirements: R1, R2, R12_
  - [ ] 2.2 Create `config/` files with zod schemas and a validating loader (supported-languages, wage-and-contribution-tables, kasambahay-requirements, agency-contacts with `verified` flag, glossary, distress terms)
    - Reject overlapping effective-date rows
    - _Requirements: R4, R5, R7, R9_
  - [ ] 2.3 Write tests for config schema validation and overlapping-date rejection
    - _Requirements: R5, R9_
  - [ ] 2.4 Add a launch check script that fails a production build if any agency contact is unverified
    - _Requirements: R9.3_

- [ ] 3. Deterministic calculators (packages/shared)
  - [ ] 3.1 Implement integer-centavos `Money` helpers and `selectTable(tables, date)` with `NoTableForDate`
    - _Requirements: R5.2, R5.3, R5.8_
  - [ ] 3.2 Implement `computeMonthlyGross`, `computeDeductions`, `computeThirteenthMonth` returning `CalcResult` with inputs and formula id
    - Return missing-field list when inputs are incomplete
    - _Requirements: R5.1, R5.5, R5.6, R5.7_
  - [ ] 3.3 Write unit tests: normal cases, partial months, mid-year start, leap year, boundary effective dates, missing table
    - _Requirements: R5.9_
  - [ ] 3.4 Write fast-check property tests: integer results, non-negative, deterministic, monotonic where applicable
    - _Requirements: R5.9_

- [ ] 4. API foundation
  - [ ] 4.1 Express app with zod validation middleware, error handler, allowlist structured logger (no bodies)
    - _Requirements: R10.6_
  - [ ] 4.2 PostgreSQL schema and migrations for reference data only (glossary_terms); no tables for documents, fields, summaries, comparisons, or chat
    - _Requirements: R4.3, R10.4_
  - [ ] 4.3 No accounts and no server session; consent captured in the browser; middleware that rejects uploads without the current consent version
    - _Requirements: R10.1, R10.2, R10.3_
  - [ ] 4.4 Write supertest tests for consent-required upload and unknown document ids returning 404
    - _Requirements: R10_
  - [ ] 4.5 Write a log-leak test asserting document text never appears in captured logs
    - _Requirements: R10.6_

- [ ] 5. Provider adapters
  - [ ] 5.1 Define `OcrProvider` and `ChatProvider` interfaces; implement `MockOcrProvider` and `MockChatProvider`
    - _Requirements: R1.4, tech steering_
  - [ ] 5.2 Implement `LumenOcrProvider` and `LumenChatProvider` mapping the real API onto the interfaces (confirm API contract first)
    - Keys from env only, server-side only
    - _Requirements: R10.7_
  - [ ] 5.3 Implement schema-validated `complete()` with retry limit and `AiOutputInvalidError`
    - _Requirements: R12.3, R12.4_
  - [ ] 5.4 Write adapter contract tests run against mocks (and Lumen when keys exist)
    - _Requirements: R1, R12_

- [ ] 6. Upload and OCR
  - [ ] 6.1 UploadService: type/size/page validation from config; stream bytes to the OcrProvider without writing to disk
    - _Requirements: R1.1, R1.2, R1.3, R10.4_
  - [ ] 6.2 ExtractionService: call OcrProvider, flag low-confidence fields by threshold, map `unreadable` to retake response, return a retryable error on timeout (the browser keeps the file)
    - _Requirements: R1.5, R1.6, R1.7_
  - [ ] 6.3 Routes `POST /documents`, `GET /documents/:id`, `DELETE /documents/:id`, `GET /config/public`
    - _Requirements: R1_
  - [ ] 6.4 Write tests for rejected types/sizes/pages, unreadable response, and retry after provider failure
    - _Requirements: R1_

- [ ] 7. Verify, correct, and confirm
  - [ ] 7.1 Keep field edits in browser state with `source = user` (no server write)
    - _Requirements: R2.5, R2.8, R10.4_
  - [ ] 7.2 `POST /explain` accepting only confirmed fields in the body and building the confirmed-only payload
    - _Requirements: R2.6, R2.7_
  - [ ] 7.3 Enforce 409 on explain/compare/chat when a payload carries unconfirmed fields or raw OCR text
    - _Requirements: R2.6_
  - [ ] 7.4 Write tests that unconfirmed documents never reach the ChatProvider and that raw OCR text is excluded from the payload
    - _Requirements: R2.7, R12_

- [ ] 8. Prompts and injection defense
  - [ ] 8.1 Prompt loader for `prompts/<name>/vN.md` returning text and version
    - _Requirements: R12.2, R12.7_
  - [ ] 8.2 Author v1 templates: explain, chat, compare (system text states untrusted-block rule)
    - _Requirements: R12.1, R12.2_
  - [ ] 8.3 Implement untrusted-block wrapper that strips delimiter strings from inserted text
    - _Requirements: R12.1_
  - [ ] 8.4 Write injection fixture tests: schema-valid output, delimiter stripping, no unconfirmed OCR text in prompts
    - _Requirements: R12.6_

- [ ] 9. Summary, explanation, and glossary
  - [ ] 9.1 CalculationService wiring shared calculators with config tables and effective dates
    - _Requirements: R5_
  - [ ] 9.2 ExplanationService: summary-cards schema, "Not found in document" for missing fields, citations per claim, language parameter
    - _Requirements: R3, R4.1, R4.6_
  - [ ] 9.3 Glossary seed from `config/glossary.json` and `GET /glossary/:term` (no live generation, empty if unknown)
    - _Requirements: R4.3, R4.4, R4.5_
  - [ ] 9.4 Write tests for missing-field handling, citation presence, and language switch without re-confirmation
    - _Requirements: R3, R4_

- [ ] 10. Comparison
  - [ ] 10.1 Deterministic field diff with better/worse/neutral rules (numeric rules coded, others documented)
    - _Requirements: R6.2, R6.3_
  - [ ] 10.2 CompareService LLM summary with citations from both documents; one-sided fields shown as "Not found in document"
    - _Requirements: R6.4, R6.5, R6.6_
  - [ ] 10.3 `POST /compare` and tests for diff classification and one-sided fields
    - _Requirements: R6_

- [ ] 11. No-contract questionnaire
  - [ ] 11.1 Questionnaire definition and QuestionnaireService mapping answers to `kasambahay-requirements.json` only
    - _Requirements: R7.2, R7.4, R7.5_
  - [ ] 11.2 `POST /questionnaire/result` with general-information note and agency links for gaps
    - _Requirements: R7.6, R7.7_
  - [ ] 11.3 Write tests that output contains only config-sourced requirements
    - _Requirements: R7_

- [ ] 12. Safety and chat
  - [ ] 12.1 SafetyService: keyword pre-filter (English, Filipino, Taglish) plus optional `distressSignal` from model
    - _Requirements: R9.4, R9.5_
  - [ ] 12.2 ChatService with grounded context, calc-results-only for money questions, "cannot tell from the document" rule, legal-judgment referral
    - _Requirements: R8.1, R8.5, R8.6, R8.7_
  - [ ] 12.3 `POST /chat` as SSE with abort on disconnect; suggested "questions before signing"
    - _Requirements: R8.2, R8.3, R8.9_
  - [ ] 12.4 `GET /help` from `agency-contacts.json`
    - _Requirements: R9.2_
  - [ ] 12.5 Write tests for distress detection phrases (en/fil/tl), help surfacing without ending the conversation, and legal-judgment referral
    - _Requirements: R8, R9_

- [ ] 13. Privacy: no storage
  - [ ] 13.1 Confirm the Lumen OCR and Chat APIs support deleting a document and ending a session; if either cannot, update the consent copy to disclose that provider's retention
    - _Requirements: R10.9_
  - [ ] 13.2 ProviderCleanup: delete the OCR provider copy when a read finishes, fails permanently, or is cancelled; end the chat session when a conversation closes
    - _Requirements: R10.4, R10.9_
  - [ ] 13.3 "Clear my document": clear sessionStorage and call `DELETE /documents/:id`, then confirm completion
    - _Requirements: R10.5_
  - [ ] 13.4 Write a no-persistence test (nothing user-owned in DB, disk, or logs after a full run) and ProviderCleanup tests for every exit path
    - _Requirements: R10_

- [ ] 14. Web app foundation
  - [ ] 14.1 Vite + React + TypeScript + Tailwind with palette tokens and Fraunces/Figtree fonts
    - _Requirements: tech steering, R11.2_
  - [ ] 14.2 react-i18next with `en`, `fil`, `tl-en` locale files; language selector limited to tested languages
    - _Requirements: R4.1, R4.2, R11.8_
  - [ ] 14.3 API client, TanStack Query, routing, persistent disclaimer component, Get Help link on every screen
    - _Requirements: R9.1, R9.7_
  - [ ] 14.4 Accessibility baseline: 16px+ text, 48px targets, focus rings, `aria-live` regions, axe test setup
    - _Requirements: R11.1–R11.5_

- [ ] 15. Web screens
  - [ ] 15.1 Consent screen
    - _Requirements: R10.1_
  - [ ] 15.2 Upload screen with client compression, progress, retry from the browser copy, retake tips
    - _Requirements: R1.6, R1.8, R11.9, R11.10, R11.11_
  - [ ] 15.3 Verify screen: side-by-side image and fields, editable fields, low-confidence label, bbox highlight on focus, explicit confirm button
    - _Requirements: R2_
  - [ ] 15.4 Summary screen: cards, "Not found in document", citations with clause popover, "computed by formula" label with inputs, language switch, glossary tap, TTS button with no-voice fallback
    - _Requirements: R3, R4, R5.5, R11.6, R11.7_
  - [ ] 15.5 Compare screen and two-document flow
    - _Requirements: R6_
  - [ ] 15.6 Questionnaire screen (one question per screen, back navigation) and result view
    - _Requirements: R7.1, R7.3_
  - [ ] 15.7 Chat screen: streaming with retry, citations, suggested questions, help banner on distress, sanitized rendering
    - _Requirements: R8, R9.4, R12.5_
  - [ ] 15.8 Get Help page and "Clear my document" action
    - _Requirements: R9.2, R10.5_
  - [ ] 15.9 Component and axe tests for Verify highlight, low-confidence flag, and key screens
    - _Requirements: R2, R11_

- [ ] 16. Launch readiness
  - [ ] 16.1 Verify and mark `agency-contacts.json` entries as verified; human-review wage tables and kasambahay requirements and glossary
    - _Requirements: R5, R7, R9.3_
  - [ ] 16.2 Run full test suite, lint, build, and launch checks
    - _Requirements: all_
  - [ ] 16.3 Manual test on a low-end Android device on throttled network
    - _Requirements: R11.9, R11.11_
