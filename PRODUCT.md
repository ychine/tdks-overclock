# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Filipino workers who need to understand an employment contract or quitclaim before signing, or after signing, and who may be under financial or emotional pressure. Primary groups: kasambahay (domestic workers), OFWs, and local employees. Many are on inexpensive Android phones and slow data, may have low English or legal literacy, and may be stressed or afraid to ask questions. Secondary users: family members and friends helping a worker read a document.

## Product Purpose

Linaw reads a photo or PDF of a contract, lets the worker verify what was read, and explains the document in plain English, Filipino, or Taglish. It exists so a worker can know their pay, deductions, hours, rest days, contract length, and penalties before signing. Success means the worker understands the document and knows where to get real help, without believing the app is a lawyer.

## Positioning

Linaw explains and never advises; deterministic code owns every peso; the AI only explains confirmed fields; and every answer points back to a clause and onward to a verified agency. A generic AI chatbot cannot truthfully copy that combination of grounded math, human-verification, prompt-injection defense, and storing no user data at all.

## Operating Context

- The worker photographs or uploads a contract or quitclaim, then checks and corrects OCR fields against the original image.
- All money figures come from pure calculators over configurable wage and contribution tables, never from the LLM.
- Explanations and chat are grounded in confirmed fields; summary claims carry clause citations.
- The no-contract path is a short one-question-per-screen questionnaire answered from reviewed kasambahay requirement config.
- Two contracts can be compared field by field, with better/worse/neutral labels.
- Help is always one tap away: DOLE, DMW, OWWA, PAO, and 911 for emergencies.
- The app runs without accounts and stores no user data: the document, fields, summary, and chat live only in the browser tab and are cleared when it closes. Provider copies (Lumen OCR, Lumen Chat) are deleted as soon as they are no longer needed.

## Capabilities and Constraints

- **Explain-only.** Never legal advice. Every summary, compare, and chat surface carries the disclaimer and agency links.
- **Deterministic money.** Integer centavos; rates and contribution tables are config-driven and human-verified; missing table dates fail loudly.
- **Confirmed fields only.** The LLM never receives unverified OCR text; document text is untrusted data wrapped in delimiters.
- **Languages.** English, Filipino, Taglish. Regional languages only when marked `tested` in config.
- **Privacy.** Contracts are sensitive personal data under the PH Data Privacy Act: explicit consent before upload, no server-side storage of documents, fields, summaries, or chat, no document text in logs, provider copies deleted after use, and a "Clear my document" action. Until provider deletion is implemented and verified, the app must not claim more than it does.
- **Providers.** Lumen OCR and Lumen AI Chat live behind `OcrProvider` and `ChatProvider` adapters; keys stay server-side.
- **Accessibility.** WCAG AA contrast, 16px minimum body text, 48px minimum tap targets, full keyboard operation, visible focus, screen-reader labels, and `aria-live` for streaming and status.
- **Resilience.** Low-end Android on throttled networks; resumable upload, client compression, progress and retry states, offline handling.

## Brand Commitments

- **Name:** Linaw (placeholder name; keep it unless the user changes it).
- **Voice:** a kind, knowledgeable kuya/ate — warm, plain, never a lawyer, never corporate, never childish.
- **Binding visual constraints already chosen by the user:** off-white paper `#FBF7EF`, ink `#1B2433`, flag blue `#0038A8`, alert red `#CE1126`, sun yellow `#FCD116` used as a fill only with dark text on top; Fraunces for headlines and the brand, Figtree for body and UI; an 8-ray sun motif near the logo; a faint banig weave used sparingly.
- **Composition intent:** mobile-first, rounded cards, soft shadows, generous spacing, dark mode adapted from the same palette.
- **Agent surfaces:** modern agent UI components (prompt input, message bubbles, streaming status, citations, approval and checklist cards), not a generic chat widget.

## Evidence on Hand

- Working React app in `frontend/` implementing the landing page and ten in-app screens, three locales, dark mode, and beUI agent components.
- Demo contract data and clauses in `frontend/src/lib/contract.js`.
- Agency contacts in `frontend/src/lib/agencies.js`.
- Design briefs: `frontend/design.md` (primary), `frontend/design2.md` (Crisp visual language), `frontend/design3.md` (shadcn DESIGN.md workflow).
- Product specs: `.kiro/specs/linaw/design.md`, `requirements.md`, `tasks.md`; steering in `.kiro/steering/`.
- **Absent and not to be fabricated:** real OCR output, real provider keys, human-verified wage tables, verified agency records, testimonials, user counts, or legal conclusions. Demo values are synthetic and must stay labeled as such.

## Product Principles

1. **Clarity before cleverness.** If a stressed worker cannot understand it in seconds, it is not done.
2. **Explain, never advise.** Referral is part of the answer, not an afterthought.
3. **Math is deterministic; the AI only explains.** No peso value is ever guessed.
4. **The worker confirms the facts.** Nothing unverified reaches the explanation.
5. **Privacy is a feature, not a policy page.** Store nothing, delete provider copies, one-tap clear.

## Accessibility & Inclusion

WCAG 2.1 AA color contrast; body text at least 16px; tap targets at least 48px; keyboard operable with visible focus; screen-reader labels for controls, images, and status changes; text-to-speech with an honest fallback when a suitable voice is unavailable; usable on low-end Android and throttled networks.
