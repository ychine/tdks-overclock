# Linaw

Linaw helps Filipino workers understand their employment contract or quitclaim.
Upload a photo or PDF, check what the app read, and get a plain-language explanation in English, Filipino, or Taglish.

> Linaw **explains**. It does not give legal advice. Every summary and chat screen shows a disclaimer and links to DOLE, DMW, OWWA, and the Public Attorney's Office (PAO).

## How it works

1. **Consent**: the user agrees to how their document is collected, used, and kept.
2. **Upload**: JPG, PNG, or PDF. Limits on size and page count come from configuration.
3. **OCR**: text, per-field confidence, and bounding boxes are extracted (Lumen OCR, behind an `OcrProvider` adapter).
4. **Verify and correct**: the user reviews the original image next to the extracted fields, fixes mistakes, and confirms.
5. **Explain**: only confirmed fields go to the AI (Lumen AI Chat, behind a `ChatProvider` adapter). Output includes a 30-second summary with clause citations, glossary terms, and follow-up chat.

Also supported: contract comparison, a no-contract questionnaire (Batas Kasambahay), and a Get Help page.

## Non-negotiables

- **No legal advice.** The app explains and refers users to agencies.
- **No LLM money math.** Pure, deterministic calculators compute pay, deductions, and 13th-month pay. The LLM only explains the results. Money uses integer centavos or `decimal.js`, never floats.
- **Confirmed fields only.** The LLM never sees unverified OCR output.
- **Untrusted documents.** Document text is wrapped as untrusted data in every prompt, and model output is validated with zod before use.
- **Privacy first.** Contracts are sensitive personal data under the PH Data Privacy Act. The app requires explicit consent, works without an account, and **stores no user data**: the document and its results live only in the browser tab and are cleared when it closes, provider copies are deleted after use, "Clear my document" removes everything at once, and document content is never logged.
- **Languages.** English, Filipino, and Taglish. A regional language is offered only if marked "tested" in `config/supported-languages.json`.

## Tech stack

| Area | Choice |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS 4, React Router, GSAP and Motion, beUI agent components |
| Backend | Node, Express 5 |
| Data | Supabase (current), PostgreSQL |
| i18n | `react-i18next` with `en`, `fil`, and `tl-en` locales |
| AI | Lumen OCR and Lumen AI Chat, only behind adapter interfaces, called from the server only |
| Testing | Vitest. Every calculator needs unit and property tests |
| Fonts | Fraunces (headlines, brand), Figtree (body) |
| Palette | paper `#FBF7EF`, ink `#1B2433`, blue `#0038A8`, red `#CE1126`, yellow `#FCD116` |

## Project structure

Current layout:

```
backend/     Express API (server.js, supabase.js)
frontend/    React app
  src/pages/       Landing, Home, Consent, Upload, Reading, Review, Summary,
                   Salary, Chat, Compare, Questions, Help
  src/components/  UI and agent components
  src/i18n/        Locale files
  scripts/         check-i18n.mjs
figma-make/  Design prototype
.kiro/       Steering (product, tech, structure) and the `linaw` spec
```

Target layout from the steering docs:

```
/apps/web         React app
/apps/api         Express app
/packages/shared  Types, zod schemas, calculators (shared by web and api)
/config           supported-languages.json, wage-and-contribution-tables.json,
                  kasambahay-requirements.json, agency-contacts.json
/prompts          Versioned LLM prompt templates
```

## Getting started

Requirements: Node.js 20 or newer and a Supabase project.

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
SUPABASE_URL=
SUPABASE_SECRET_KEY=
PORT=5000
```

```bash
npm run dev     # watch mode
npm start       # production
```

The API runs at `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

```bash
npm run dev            # http://localhost:5173
npm run build
npm run preview
npm run lint
npm run check:i18n     # verify locale files stay in sync
```

Keep secrets (Supabase secret key, OCR and AI provider keys) in server environment variables. Never put them in client code or commit `.env` files.

## Specs and design

- Product rules: `.kiro/steering/product.md`
- Tech choices: `.kiro/steering/tech.md`
- Folder layout: `.kiro/steering/structure.md`
- Requirements (R1 to R12), design, and tasks: `.kiro/specs/linaw/`
- Visual design: `DESIGN.md`, `frontend/design.md`

## Accessibility

- WCAG AA contrast, body text of at least 16px, tap targets of at least 48px
- Full keyboard operation with visible focus, and screen-reader labels
- Text-to-speech on summaries, hidden with an explanation when no suitable voice exists
- Progress states, retries, and resumable uploads for slow networks and low-end Android devices

## Get help

If you are in a difficult or unsafe work situation, contact:

- **DOLE**: Department of Labor and Employment
- **DMW**: Department of Migrant Workers
- **OWWA**: Overseas Workers Welfare Administration
- **PAO**: Public Attorney's Office

Contact details live in `config/agency-contacts.json`. Each entry has a `verified` flag, and production builds fail if any entry is unverified.
