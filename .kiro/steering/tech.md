# Tech
- Frontend: React + TypeScript + Vite, Tailwind, beUI agent components
  (Prompt Input, Message, Message Bubble, Message Scroller, Streaming Response,
  Citations, Agent Loading States, Agent Activity, Approval Card, Todo List).
- Backend: Node + Express + TypeScript, zod validation.
- DB: PostgreSQL (migrations with a tool like node-pg-migrate or Drizzle).
- i18n: react-i18next, locale files: en, fil, tl-en (Taglish).
- Money: integer centavos or decimal.js, never floats.
- External AI: Lumen OCR and Lumen AI Chat, ONLY behind adapter interfaces
  (OcrProvider, ChatProvider) so they can be mocked and swapped. Keys in env vars.
- Tests: Vitest; property/unit tests required for every calculator.
- Fonts: Fraunces (headlines, brand), Figtree (body). Palette tokens in tailwind config:
  paper #FBF7EF, ink #1B2433, blue #0038A8, red #CE1126, yellow #FCD116.
