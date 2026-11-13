# Linaw

Linaw helps Filipino workers understand an employment contract or quitclaim before they sign it. Upload a photo or PDF, check what the app read, and get a plain-language explanation in English, Filipino, or Taglish.

> Linaw explains. It does not give legal advice. It never says a contract is legal or illegal, or whether to sign.

## The problem

Employment contracts and quitclaims are written in dense legal English, and workers are often asked to sign on the spot. Professional review is expensive and hard to reach, especially for kasambahay, local employees, and OFWs. The result is people agreeing to terms they do not understand: low or unclear pay, excessive penalties, long hours, or giving up rights in a quitclaim.

## The solution

Linaw turns the document into something a worker can actually check:

1. **Consent** - the user agrees to how the document is handled.
2. **Upload** - JPG, PNG, or PDF (20 MB default, configurable).
3. **Read** - Lumen OCR extracts text and per-field confidence.
4. **Verify and correct** - the user compares the original page with the extracted salary, start date, term, hours, rest day, and penalty, fixes mistakes, and confirms.
5. **Understand** - a short summary, glossary, deterministic salary breakdown, and "Ask Linaw" chat that answers questions about the confirmed contract.
6. **Get help** - referrals to DOLE, DMW, OWWA, and PAO.

Also included: worker-type guidance (kasambahay, OFW, local), contract comparison, and a no-contract questionnaire.

Guardrails:

- **Confirmed fields only.** The AI never sees unverified OCR text.
- **No AI money math.** `frontend/src/lib/payroll.js` computes pay, deductions, and 13th-month pay deterministically.
- **Verified law only.** Chat is grounded in human-verified provisions from `backend/src/legal/`, filtered by worker type.
- **No accounts, no app-side document database.** Working state lives in the browser tab and is cleared when it closes. Secrets stay on the server and document text is never logged.

## How Lumen is used

Both integrations are called from the Node backend, so `LUMEN_API_KEY` and `LUMEN_API_SECRET` never reach the browser.

**Lumen OCR** - `backend/src/services/lumenOcr.js`, proxied through `/api/ocr`:

- Uploads the raw PDF/JPEG/PNG with `POST /documents`, then polls `GET /documents/:id` until the read finishes.
- Fetches `GET /documents/:id/pages?IncludeWords=true` for words plus layout, and exposes Lumen's review endpoints for corrections.
- The frontend (`frontend/src/lib/extract.js`) converts pages into the six contract fields with confidence scores and source lines.

**Lumen AI Chat** - `backend/src/services/lumenChat.js`, proxied through `/api/chat`:

- Opens one Lumen session per contract, then sends one message per question.
- The server builds that message (`chatMessage.js`): explanation rules, the user's confirmed fields (with corrected flags), and at most two verified law excerpts selected for the question and worker type (`legalRefs.js`). If verified law is unavailable, the answer explains the contract only.
- Lumen tags facts with `[C:key]` / `[L:id]`; the server keeps only citations to fields and law it actually sent, drops invented ones, and returns the answer with its basis.
- Timeouts, busy responses, and expired sessions are mapped to a consistent error envelope so the UI can offer a retry.

## How to run

Requirements: Node.js 20+ and Lumen API credentials.

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
SUPABASE_URL=
SUPABASE_SECRET_KEY=
LUMEN_OCR_BASE_URL=
LUMEN_CHAT_BASE_URL=
LUMEN_CHAT_INSTANCE_ID=
LUMEN_API_KEY=
LUMEN_API_SECRET=
```

```bash
npm run dev     # node --watch, reads .env
npm start       # production
```

The API runs at `http://localhost:5000`. OCR and chat return a clear "not configured" error if the Lumen values are missing. Supabase is only used by the demo `/api/todos` route in `server.js`.

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
# VITE_API_URL=http://localhost:5000
```

```bash
npm run dev            # http://localhost:5173
npm run build
npm run preview
npm run lint
npm run check:i18n     # locale + glossary keys stay in sync
```

CORS accepts any `http://localhost:<port>`, so Vite can fall back from 5173 to 5174 and still work.

## Layout

```
backend/     Express API: Lumen OCR/chat proxies, legal references
frontend/    React + Vite + Tailwind app: pages, i18n, extractors, calculators
figma-make/  Design prototype
.kiro/       Product/tech steering and specs
```

Product rules and specs live in `.kiro/steering/` and `.kiro/specs/`; visual direction is in `DESIGN.md`.
