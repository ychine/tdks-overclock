---
name: Linaw
description: Plain-language contract understanding for Filipino workers — a warm kuya/ate, never a lawyer.
colors:
  paper: "#FBF7EF"
  surface: "#FFFDFA"
  surface-sunk: "#F4EEE3"
  ink: "#1B2433"
  ink-soft: "#586377"
  hairline: "#DDD8CE"
  flag-blue: "#0038A8"
  blue-soft: "#E9F0FF"
  flag-red: "#CE1126"
  red-soft: "#FFF0F1"
  sun-yellow: "#FCD116"
  success-green: "#16865B"
  success-soft: "#E7F5EE"
  midnight-navy: "#101A33"
  on-solid: "#FFFFFF"
typography:
  display:
    fontFamily: "Fraunces, Georgia, ui-serif, serif"
    fontSize: "4.5rem"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Fraunces, Georgia, ui-serif, serif"
    fontSize: "2.75rem"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0em"
  body:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  label:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.01em"
rounded:
  field: "10px"
  control: "12px"
  card: "16px"
  panel: "24px"
  sheet: "24px"
  full: "999px"
spacing:
  hairline: "1px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  section: "48px"
  page: "32px"
components:
  button-primary:
    backgroundColor: "{colors.flag-blue}"
    textColor: "{colors.on-solid}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    height: "48px"
    padding: "0 20px"
  button-primary-hover:
    backgroundColor: "#003299"
    textColor: "{colors.on-solid}"
    rounded: "{rounded.control}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    height: "48px"
    padding: "0 20px"
  button-sun:
    backgroundColor: "{colors.sun-yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    height: "48px"
    padding: "0 20px"
  button-danger:
    backgroundColor: "{colors.flag-red}"
    textColor: "{colors.on-solid}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    height: "48px"
    padding: "0 20px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "20px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "16px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    height: "48px"
    padding: "0 14px"
  badge:
    backgroundColor: "{colors.blue-soft}"
    textColor: "{colors.flag-blue}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    height: "48px"
    padding: "0 16px"
  nav-active:
    backgroundColor: "{colors.blue-soft}"
    textColor: "{colors.flag-blue}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    height: "44px"
    padding: "0 12px"
---

# Design System: Linaw

## Overview

**Creative North Star: "Liwanag sa Kusina" — light in the kitchen.**

Linaw is the warm, well-lit kitchen where a trusted kuya or ate spreads a contract on the table, points at the line that matters, and explains it in words you already know. The light is honest and clear; the room is familiar, not corporate. Paper, woven banig, and the eight-ray sun are the material memory. The interface never performs authority at the worker; it sits beside them.

The system is mobile-first and low-bandwidth by instinct. Screens are calm single-column tasks on a phone (390px first), with generous gutters and one obvious action. Desktop widens the same structure rather than replacing it. Density is focused-app, not marketing-minimal: real content, real states, and thumb-sized controls, but with enough quiet that a stressed person is not overwhelmed.

The visual world is deliberately **light-dominant** because the use scene is daylight, a barangay desk, a dorm, or a phone held in one hand while the other holds a contract. Dark mode mirrors the same world at night: midnight navy ground, warm paper ink, and the same flag accents. The agent surfaces borrow Crisp's precision — hairline borders, a disciplined type scale, one saturated action color, and calm support-UI polish — while remaining unmistakably Filipino. Structure and states follow the shadcn DESIGN.md discipline: semantic tokens, one role per component, no decorative nesting, and every control with hover, focus, disabled, loading, and error behavior.

**Key Characteristics:**
- Warm off-white paper, deep ink, flag blue for action, sun yellow as a fill, alert red only for worry.
- Fraunces speaks; Figtree works. The serif is for the brand, page titles, and money; UI chrome stays sans.
- Hairline-first depth: flat surfaces with one restrained shadow where something truly floats.
- Rounded, touchable, 48px controls; 16px body floor; WCAG AA contrast.
- The eight-ray sun and faint banig are seasoning, never wallpaper.

## Colors

A warm paper ground carrying three committed flag roles — trust blue, warning red, and sun yellow as a highlighter — with a deep navy for the one dramatic band.

### Primary
- **Trust Blue** (#0038A8): the action and navigation voice. Primary buttons, active nav, in-text links, source markers, and the "this is the way forward" accent. It should own roughly one action per screen, not the whole screen.
- **Blue Wash** (#E9F0FF): the quiet companion to trust blue — selected rows, icon tiles, active-nav tracks, and information callouts.

### Secondary
- **Sun Yellow** (#FCD116): a highlighter and a fill, never a text color on light ground. It marks low-confidence fields, highlight CTA fills on dark bands, and the sun motif. Always pair it with ink (#1B2433) on top.
- **Alert Red** (#CE1126): reserved for worry — deductions, penalties, risky changes, emergencies, and destructive actions. Red is a signal, not a brand mood.

### Tertiary
- **Success Green** (#16865B): a checked field, a completed step, a verified agency. Its soft tint (#E7F5EE) carries the fill; the solid green carries the icon.

### Neutral
- **Paper** (#FBF7EF): the page ground in light mode. The room itself.
- **Surface** (#FFFDFA): cards, panels, sheets, inputs — the paper objects on the room.
- **Surface Sunk** (#F4EEE3): segmented tracks, table headers, inset wells, and quiet secondary grounds.
- **Ink** (#1B2433): primary text and the dark text that sits on yellow.
- **Ink Soft** (#586377): secondary text, captions, hints, and meta. Never use it for critical body copy on a tinted surface without checking contrast.
- **Hairline** (#DDD8CE): the 1px border that does most of the depth work.
- **Midnight Navy** (#101A33): the single dramatic band (privacy, trust) and the dark-mode ground family.

### Named Rules
**The Sun Is a Fill Rule.** Yellow never appears as text on a light surface and never as a thin outline around light text. It is a fill with ink on top, or a small icon tile, or the sun. If the only way to see it is as lettering, delete it.

**The One Blue Rule.** Trust blue is spent on the single most important action, the active navigation state, and source links. It is not a decorative wash. If two unrelated elements both shout blue on one screen, one of them is wrong.

**The Red Means Worry Rule.** Alert red only appears where the worker should pause: a deduction, a penalty, a worse contract term, an unreadable photo, an emergency. Never use red for brand decoration or celebrations.

## Typography

**Display Font:** Fraunces (with Georgia, ui-serif fallback)
**Body Font:** Figtree (with ui-sans-serif, system-ui fallback)
**Label/Mono Font:** Figtree for labels; tabular numerals from the same face for money.

**Character:** Fraunces is the warm, slightly literary voice of the kuya/ate — human, a little hand-made, never stiff. Figtree is the clear working voice that carries dense legal information without fatigue. The pairing reads as "a person explaining" over "a document", which is the whole product.

### Hierarchy
- **Display** (600, clamp 3rem–4.5rem, 1.02): the brand name, landing hero, and the largest page titles. Letter-spacing no tighter than -0.03em.
- **Headline** (600, 2rem–2.75rem, 1.05): page titles and major section headings. Sentence case.
- **Title** (700 sans, 1.125–1.375rem, 1.3): card titles, panel headings, and row labels. This is where most in-app hierarchy lives.
- **Body** (400, 1rem, 1.5): all reading copy. Measure 65–75ch; never below 16px.
- **Label** (600, 0.875rem, 1.4): buttons, chips, badges, form labels, table headers, and metadata.
- **Money** (Fraunces 600, 2–6xl, tabular): take-home pay and summary figures. Always `font-variant-numeric: tabular-nums`.

### Named Rules
**The 16px Floor Rule.** No body, hint, input, or legal-term text ships below 16px. 14px is for labels and metadata only. If a layout only fits at 13px, the layout is wrong.

**The Serif in the Parlor Rule.** Fraunces is the voice at the table: brand, page titles, big money, and the landing's promise. It never sets buttons, form labels, table cells, or navigation. Those are Figtree.

**The One Weight Step Rule.** Emphasis comes from a weight step (400 → 600/700) or scale step, not from gradient text, text shadows, or italics used as decoration.

## Layout

Mobile-first. The canonical frame is a 390px phone: 16px page gutters, single column, one primary action inside thumb reach, a sticky top bar, and a five-item bottom navigation. At `lg` the bottom nav becomes a top nav, the page widens to a 1180px content frame (1240px for the landing), and two-column task layouts appear — most importantly the Verify screen's document-and-fields split.

- **Container:** `min(1180px, 100% - 32px)` for app pages; `min(1240px, 100% - 32px)` for the landing. Narrow task pages cap at 760px.
- **Rhythm:** 4px base unit. Tight groups use 4–8px; related blocks 12–16px; sections 24–48px; page bands 64–96px. More space above a heading than below it.
- **Cards:** 16px radius for objects; 24px for a screen's one primary panel; list groups share one hairline frame and divide rows, never box each row.
- **Reading measure:** prose 60–72ch; legal clauses can run to 75ch; summary rows stay short.
- **Breakpoints:** 390 (phone) → 640 → 768 → 1024 (nav shifts) → 1280 → 1440. Test 390 and 1440 every time.
- **Print:** summary prints on white with the disclaimer retained; navigation and controls hide.

### Named Rules
**The Thumb Rule.** On a phone, the primary action sits in the lower half of the viewport or in a full-width control. Do not strand the only way forward at the top-right.

**The Single Panel Rule.** A working screen has one 24px primary panel at most. Everything else is a 16px card or a list group. Two large panels competing for the same task is a composition failure.

## Elevation & Depth

Hybrid and hairline-first. Depth is mostly drawn with a 1px hairline and a tonal step, not with floating cards everywhere. Shadows are soft, cool-tinted, and carry a real offset — never a zero-offset colored halo. Things that genuinely float (sheets, the landing preview, sticky chat composer) get the stronger shadow; resting content gets a hairline only.

### Shadow Vocabulary
- **Card** (`0 1px 2px rgb(16 24 40 / 0.05), 0 4px 12px rgb(16 24 40 / 0.05)`): a surfaced item that sits above the page without leaving it.
- **Float** (`0 2px 8px rgb(16 24 40 / 0.08), 0 12px 40px rgb(16 24 40 / 0.12)`): sheets, the landing artifact, sticky composer, and dialogs.
- **Panel ring** (`inset 0 0 0 2px rgb(255 255 255 / 0.85)` plus Card): the one primary panel, giving it a lit paper edge.
- **Focus** (`outline: 3px solid var(--brand); outline-offset: 2px`): keyboard focus is never removed and never replaced by a color-only change.

### Named Rules
**The Hairline First Rule.** At rest, a surface is flat with a 1px border. Reach for a shadow only when the surface actually overlaps or floats. A shadow on a non-overlapping card is decoration.

**The No Nested Card Rule.** A card inside a card inside a panel is always wrong. Use a list group, a divider, or a tonal section instead. If you need a border to separate content inside a card, the outer card is probably unnecessary.

**The Flat-By-Default Rule.** Hover, focus, and active states may lift by 1–2px or deepen a shadow; the resting state stays calm. Do not animate shadows continuously.

## Shapes

A soft, touchable form language. Corners are generous but never pill-shaped except for badges, chips, and status labels. Radii: 10px fields, 12px buttons and segmented controls, 16px cards and callouts, 24px panels and sheets, full pills for badges and suggestion chips. The eight-ray sun is the recurring circular signature. The banig weave appears only as a very low-contrast texture in empty, upload, or liminal states.

Borders are 1px hairlines. Dashed borders are reserved for upload/drop zones, never for content cards. No side-stripe callouts, no clipped polygons, no decorative blobs.

### Named Rules
**The Banig Restraint Rule.** The woven pattern is a place, not a texture library: use it at low contrast in empty states, upload zones, and one divider at most. It never sits under body text.

**The Sun Is Round Rule.** The logo mark, the sun motif, and the "you are here" step are circles. Do not convert the sun into a square tile or a star.

## Components

Every component has one job, a fixed shape, and explicit states. Surfaces are told apart by radius, border, and elevation — not by decoration. Components extend the existing local primitives in `frontend/src/components/ui`; do not add a second button or card system.

### Buttons
- **Shape:** 12px radius, minimum 48px height (small 44px, large 56px), bold Figtree label.
- **Primary:** trust blue fill, white label, a subtle inset top highlight and a soft blue-tinted lift. One per screen.
- **Secondary:** surface fill, hairline border, ink label. Supporting actions and alternatives.
- **Ghost:** transparent, brand text, no border. Low-emphasis actions and inline links.
- **Sun:** yellow fill with ink label, for a highlight CTA on a navy band only.
- **Danger:** alert red fill with white label. Destructive and emergency actions only.
- **Hover / Focus:** hover brightens or deepens the fill; focus is a 3px brand ring with 2px offset; pressed scales to 0.97.
- **Disabled / Loading:** 45% opacity, not-allowed cursor; loading keeps the label and swaps the leading icon for a spinner.

### Chips
- **Style:** full pill, hairline border, surface fill, 48px minimum height, label-size text.
- **State:** hover fills with blue wash and a brand border; selected becomes blue wash with brand text; they are suggestions, never status badges.

### Cards / Containers
- **Corner Style:** 16px cards, 24px panels.
- **Background:** surface on paper; surface-sunk for inset wells and table headers.
- **Shadow Strategy:** hairline at rest; Card or Float only when overlapping (see Elevation).
- **Border:** 1px hairline. Dashed only for upload zones.
- **Internal Padding:** 16px cards, 20–24px panels, 14px list rows.
- **No nested cards.** Use `ListGroup` + dividers for related facts.

### Inputs / Fields
- **Style:** surface fill, 1px hairline, 10px radius, 48px height, 14px horizontal padding, 16px text.
- **Focus:** brand border plus a 4px brand wash ring.
- **Error:** alert border, alert message with an icon, `aria-invalid` and `aria-describedby`.
- **Disabled / Loading:** reduced opacity, not-allowed cursor; a loading field keeps its label and shows a quiet inline status.

### Navigation
- **Top bar:** sticky, 74px, paper with 85% opacity and backdrop blur, hairline bottom border once scrolled. Brand left; desktop items center-right; language and theme controls right.
- **Bottom bar (mobile):** five items, 48px+ targets, icon over label, active state is a blue-wash rounded track plus brand text, never color alone. Respect the safe-area inset.
- **Active state:** `aria-current="page"`, blue wash track, brand text; the active indicator may slide between items with one Motion layout animation.

### Agent Surface (beUI)
The chat is a modern agent support surface, not a generic messenger: rounded message bubbles (assistant soft surface, user solid brand), a floating auto-growing prompt input with a send button, a shimmering thinking status, collapsible source citations under answers, and approval/checklist cards with explicit choice buttons. All model text renders as plain text or sanitized markdown; links and citations remain keyboard reachable. Streaming and status changes use `aria-live`.

### Summary Cards (signature)
The 30-second summary is **six cards**, not a table: Sahod, Bawas, Oras ng trabaho, Day off, Haba ng kontrata, and Parusa/penalties. Each card carries an icon tile, a title, a large value, a one-line detail, and a citation chip that opens the clause. Worry cards use the red soft ground and a "Pakisuri" badge; missing fields say "Not found in document" and never guess. Money cards carry the "computed by formula" label and expose their inputs.

### Document Viewer (signature)
The Verify screen pairs the original page with editable fields. Selecting a field draws a brand-blue rectangle over the normalized bounding box on the document; a low-confidence field uses the sun-yellow highlight and an explicit "Pakisuri" text label, not color alone. The viewer is scroll-synced on desktop and tabbed on mobile.

## Do's and Don'ts

### Do:
- **Do** keep the paper ground, ink, and one clear primary action per screen.
- **Do** use the sun as a fill with ink on top, or as the circular mark.
- **Do** set body copy at 16px or larger and give every control a 48px tap target.
- **Do** pair every worry signal with a word and an icon, never color alone.
- **Do** cite the clause for every summary claim and show the formula for every peso.
- **Do** keep the professional and legal disclaimer visible on summary, compare, and chat surfaces.
- **Do** use Fraunces for brand, page titles, and big money; Figtree for everything functional.
- **Do** test 390px and 1440px with real, long Taglish copy.

### Don't:
- **Don't** use yellow as text on a light surface or red as brand decoration.
- **Don't** nest cards or put a colored side stripe on a callout.
- **Don't** use gradient text, glass as decoration, or zero-offset colored halos.
- **Don't** add an eyebrow/kicker above a heading; the heading carries itself.
- **Don't** render model output as HTML without sanitization.
- **Don't** let the LLM calculate or state a peso figure; calculators own money.
- **Don't** present generated glossary definitions or unverified agency contacts as fact.
- **Don't** ship a screen without its empty, loading, error, and offline states where the flow needs them.
