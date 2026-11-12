# Linaw Sitemap

The app has no URL router. It is a single page in `src/App.jsx` that switches between a public landing page and 10 in-app screens using React state (`landed` and `screen`).

## 1. Landing (public entry)

Page: `src/pages/Landing.jsx`. Shown when `landed = false`.

```
Landing
├─ Header: Brand, anchor links, dark mode toggle, "Simulan" button
├─ Hero ("Linaw sa kontrata") ─ "Suriin ang kontrata ko" → App
├─ Trust strip
├─ #paano        Paano gumagana (3 steps)
├─ #para-kanino  Para kanino (quotes)
├─ #privacy      Privacy
├─ Final CTA ("Simulan ngayon") → App
└─ Footer ("Buksan ang app") → App
```

All "enter" buttons set `landed = true` and open the **Home** screen.

## 2. App shell

Shown when `landed = true`. Layout comes from `App.jsx`.

```
App shell
├─ Nav (components/Nav.jsx): side nav on desktop, bottom nav on mobile
│    Home · Buod (Summary) · Tanong (Chat) · Compare · Tulong (Help)
├─ Topbar (components/Topbar.jsx)
│    Brand (returns to Landing) · screen title · language select · dark mode toggle
├─ Current screen
└─ Footer (disclaimer)
```

## 3. Screens

| Screen key  | Title (Topbar)    | Page file                | In main nav |
| ----------- | ----------------- | ------------------------ | ----------- |
| `home`      | Home              | `pages/Home.jsx`         | Yes         |
| `upload`    | Upload            | `pages/Upload.jsx`       | No          |
| `reading`   | Binabasa          | `pages/Reading.jsx`      | No          |
| `review`    | Check & Correct   | `pages/Review.jsx`       | No          |
| `summary`   | 30-Second Summary | `pages/Summary.jsx`      | Yes (Buod)  |
| `salary`    | Salary Breakdown  | `pages/Salary.jsx`       | No          |
| `chat`      | Magtanong         | `pages/Chat.jsx`         | Yes (Tanong)|
| `compare`   | Compare           | `pages/Compare.jsx`      | Yes         |
| `questions` | Walang kontrata   | `pages/Questions.jsx`    | No          |
| `help`      | Get Help          | `pages/Help.jsx`         | Yes (Tulong)|

## 4. Navigation flow

```
Landing ──enter──▶ Home
                    ├─ "Mag-upload ng kontrata" ▶ Upload
                    │     └─ Kunan / Pumili ▶ Reading ──(auto, ~5s)──▶ Review
                    │                                                    └─ "Tama na ito" ▶ Summary
                    │                                                         ├─ "Tingnan ang salary breakdown" ▶ Salary
                    │                                                         │     └─ "May tanong tungkol sa sahod" ▶ Chat
                    │                                                         └─ "May itatanong ako" ▶ Chat
                    ├─ "Wala akong kontrata" ▶ Questions (3 questions ▶ rights result + DOLE 1349)
                    └─ "Ikumpara ang dalawang kontrata" ▶ Compare

Main nav (any in-app screen) ▶ Home · Summary · Chat · Compare · Help
Topbar brand ▶ Landing
```

Upload, Reading, Review, Salary and Questions can only be reached through the flow above, not from the main nav.

## 5. In-page states (no separate route)

| Screen    | State / overlay                                                              |
| --------- | ---------------------------------------------------------------------------- |
| Upload    | Blurry photo error banner (demo button)                                      |
| Review    | "Mga detalye" and "Original" tabs on mobile; selecting a field shows its source in the document |
| Summary   | Bottom sheet explaining a legal term (Quitclaim, Probationary, Liquidated damages) |
| Chat      | Suggested questions; sample answer with source citation                      |
| Compare   | Upload step, then comparison results after adding the new contract           |
| Questions | Question steps 1 to 3, then the results view                                 |
| Help      | Offline banner (demo button); agency cards: DOLE, DMW, OWWA, PAO; Call 911   |

## 6. Project file map

```
frontend/
├─ index.html
├─ vite.config.js            React + Tailwind v4 + "@" alias
├─ public/favicon.png
└─ src/
   ├─ main.jsx
   ├─ App.jsx                screen switching, dark mode, language
   ├─ index.css              Tailwind import + app styles
   ├─ components/            Icon, Brand, Button, Topbar, Nav, DocumentMock
   ├─ pages/                 Landing, Home, Upload, Reading, Review,
   │                         Summary, Salary, Chat, Compare, Questions, Help
   └─ lib/supabase.js        Supabase client (not used by any screen yet)
```

## 7. Notes

- `react-router-dom` is installed but not used, so there are no shareable URLs and the browser back button does not move between screens.
- If real routes are added later, a natural mapping is `/`, `/app`, `/app/upload`, `/app/reading`, `/app/review`, `/app/summary`, `/app/salary`, `/app/chat`, `/app/compare`, `/app/questions`, `/app/help`.
