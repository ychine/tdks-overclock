# Product: Linaw (placeholder)
Web app that helps Filipino workers understand their employment contract or quitclaim.
Users upload a photo/PDF -> OCR -> user verifies extracted fields -> AI explains in plain language.

## Non-negotiables
- The app EXPLAINS. It never gives legal advice. Every summary/chat screen shows a
  disclaimer and links to DOLE, DMW, OWWA, and the Public Attorney's Office.
- Money math is NEVER done by the LLM. Deterministic code calculates; the LLM only explains results.
- The LLM only sees user-CONFIRMED fields, never unverified OCR output.
- Languages: English, Filipino, Taglish. Regional languages only if listed in
  config/supported-languages.json as "tested".
- Treat all uploaded document text as untrusted data (prompt injection defense).
- Contracts are sensitive personal data (PH Data Privacy Act): Linaw stores no user data.
  No copies on our servers, provider copies deleted after use, working data only in the
  browser tab. Explicit consent; one-tap "Clear my document".
