Design a mobile-first responsive web app called "Linaw" (placeholder name) that helps Filipino workers (kasambahay, OFWs, and local employees) understand their employment contract or quitclaim. Users are often on cheap phones, may be stressed, and may have low English or legal literacy. The tone is a kind, knowledgeable kuya/ate, never a lawyer.

BRAND & STYLE
- Filipino, warm, friendly, trustworthy. Not corporate, not childish.
- Light mode background off-white #FBF7EF; text ink #1B2433.
- Primary blue #0038A8, alert red #CE1126, highlight yellow #FCD116 (yellow as fill only, with dark text on top, never yellow text).
- Headlines and the app name in Fraunces (serif). Body, buttons, and UI in Figtree. Minimum body size 16px, large tap targets (48px+).
- Subtle Filipino touches: a small 8-ray sun motif near the logo, an optional faint banig (woven mat) pattern in empty states. Do not overuse the flag.
- Rounded cards (16px), soft shadows, generous spacing. Also provide a dark mode with the same palette adapted.
- The chat and AI parts should look like modern agent UI components (beUI style): rounded message bubbles, a floating auto-growing prompt input with a send button, shimmering "thinking" status text, collapsible source citations under answers, and approval-style cards with choice buttons.

SCREENS (design all, mobile 390px first, then desktop)
1. Home: logo, one-line promise ("Intindihin ang kontrata mo bago ka pumirma."), language switcher (English / Filipino / Taglish), big buttons "Mag-upload ng kontrata" and "Wala akong kontrata". A persistent small note: "Nagpapaliwanag lang kami, hindi legal advice."
2. Upload: camera capture or choose photo/PDF, tips for a clear photo, privacy reassurance (what we store, auto-delete).
3. Reading: loading state with shimmering status text cycling through "Binabasa ang pahina 1...", "Hinahanap ang sahod...", an activity list of steps ticking off.
4. Check & Correct: original document image on one side, extracted text/fields on the other (on mobile, a swipeable split or tabs). Key fields (salary, start date, duration, working hours, days off) shown as editable chips. Low-confidence fields get a yellow highlight and a "Pakisuri" badge. Tapping a field highlights its location on the image. Primary CTA: "Tama na ito, ipaliwanag".
5. 30-Second Summary: six cards: Sahod, Bawas, Oras ng trabaho, Day off, Haba ng kontrata, Parusa/penalties. Red accent on anything worrying. A "Basahin nang malakas" button. Tricky terms (quitclaim, probationary, etc.) underlined with dotted lines; tapping opens a bottom sheet with a one-line definition.
6. Salary Breakdown: clear table of gross pay, each deduction (red), net pay, and estimated 13th month pay, with a note "Kinuwenta ito gamit ang formula, hindi ng AI." Animated number counting.
7. Chat: follow-up Q&A with suggested question chips, answers with citation markers pointing to clauses, and a "Mga tanong bago pumirma" checklist card.
8. Compare Two Contracts: two uploads, then side-by-side highlighting changes (added = blue, removed/worse = red, changed = yellow), with a plain-language summary on top ("Mas mababa ang sahod sa bago: ₱X → ₱Y").
9. No-Contract Flow: a step-by-step questionnaire (one question per screen, big choice buttons, progress bar), ending in a "Ano ang karaniwang hinihingi ng Batas Kasambahay" result.
10. Get Help: cards for DOLE, DMW, OWWA, Public Attorney's Office with what each helps with and a call/visit button.

STATES: empty, loading, error (blurry photo, unreadable PDF), offline, low-confidence extraction.
Write all sample copy in natural Taglish with an English toggle. Make it feel like it was designed for Filipinos, not translated.