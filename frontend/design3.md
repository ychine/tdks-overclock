# shadcn/ui DESIGN.md

## What this is
shadcn/ui is a component source pattern built around copyable React components, Radix primitives, Tailwind styling, and local ownership of UI code.

DESIGN.md helps agents use shadcn-style components with product taste instead of producing the same default dashboard in every repo.

## Why this page exists in DesignMD
This reference is not a scraped brand style page. It is a workflow page for teams that want to pair shadcn/ui component documentation with a durable DESIGN.md file.
Use it when an AI builder needs visual taste before it edits Tailwind classes, creates React components, or turns a prompt into a working interface.
The goal is practical: make the agent read a small design contract before it starts guessing color, density, hierarchy, radius, and component behavior.

## How DESIGN.md fits the workflow
- List which shadcn components are already installed before asking the agent to build a screen.
- Document variants, radius, borders, density, and empty states that differ from defaults.
- Tell agents to extend local components rather than pasting new copies without checking the repo.
- Use component examples to show how cards, tables, dialogs, sidebars, and forms should feel.
- Add accessibility notes because primitives help but product composition still matters.
- Keep DESIGN.md close to the source code, usually in the project root or beside the frontend app that owns the product surface.
- Treat the file as a living design contract. Update it after visual decisions change, not only after a full redesign.
- Reference the file explicitly in your coding-agent instructions so it is read before UI work begins.
- Prefer concrete values over adjectives. Agents follow `--radius-card: 8px` more reliably than "make it polished".
- Pair visual rules with acceptance checks: responsive behavior, hover states, empty states, error states, and accessibility.

## Recommended DESIGN.md structure
A useful DESIGN.md for this workflow should be readable by a human reviewer and precise enough for an agent.

### Product feel
- Define the product category and emotional target in one paragraph.
- Name what the interface should avoid, not only what it should become.
- Include the density target: sparse marketing, focused SaaS, data-heavy console, or code-first tool.

### Color
- Put canonical color values in CSS variables or token names.
- Explain semantic usage: text, muted text, background, surface, border, accent, success, warning, danger.
- Include dark mode only if the product really supports it.

### Typography
- Name font families or safe fallbacks.
- Define title, section, body, meta, and code sizes.
- Avoid viewport-scaled font rules unless there is a strict reason.

### Layout
- Describe max widths, grid behavior, sidebars, card rhythm, and mobile collapse rules.
- Include stable dimensions for repeated UI such as cards, nav items, toolbar buttons, and preview frames.
- Name the layouts that should not be used, such as marketing hero cards inside operational dashboards.

### Components
- Component sections should map page needs to Button, Card, Dialog, Table, Tabs, Select, and Form.
- Variant sections should define primary, secondary, ghost, destructive, and icon-only behavior.
- Composition sections should ban nested decorative cards when the product design system does.
- Buttons need visible hover and active states.
- Forms need labels, helper text, validation errors, and disabled/loading states.
- Empty states should give a useful next action instead of a decorative placeholder.

### Agent rules
- Read DESIGN.md before editing UI files.
- Reuse existing components before creating new primitives.
- Do not overwrite product copy unless the task explicitly asks for copy changes.
- Verify screenshots at desktop and mobile widths for public pages.
- Keep generated UI aligned with the product, not with a generic template gallery.

## Token example
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --card: 0 0% 100%;
  --border: 214 32% 91%;
  --primary: 222 89% 55%;
  --radius: 0.5rem;
}
```

## Example prompt
```text
Build this shadcn/ui screen from existing local components. Read DESIGN.md first, keep the documented radius and density, include loading and empty states, and do not add a new primitive until you confirm one is missing.
```

## Common mistakes
- Installing or copying components that already exist locally.
- Accepting default shadcn spacing when the product has a tighter system.
- Creating card-inside-card layouts for page sections.
- Forgetting form validation, focus, and disabled states.
- Letting the agent invent a new palette because no semantic color tokens were provided.
- Asking for "premium" or "modern" without giving measurable constraints.
- Forgetting focus states, keyboard states, and loading states.

## Review checklist
- The component inventory is checked before implementation.
- Variants and states match DESIGN.md.
- The UI does not look like an unstyled starter template.
- The final screen remains accessible and responsive.
- The generated UI still uses the repo component system.
- Text fits inside buttons, cards, tabs, and mobile nav without overlap.
- Screenshots show real product state, not only an empty happy path.
- The final PR says whether DESIGN.md changed and why.

## Implementation workflow
Use this sequence when turning the reference into production UI:

1. Read the source page and the local DESIGN.md file.
2. Identify which parts are reference material and which parts are product-owned rules.
3. Check the existing component inventory before adding any new component.
4. Write or update the smallest design-memory section that will guide the task.
5. Implement the UI with existing framework, routing, and styling conventions.
6. Add loading, empty, error, hover, active, disabled, and focus states where the surface needs them.
7. Verify mobile and desktop layouts before considering the task complete.
8. Run the relevant code gates for the repository.
9. Update the design memory if the implementation created a reusable visual rule.
10. Keep source attribution in the final page or handoff.

## Publishing gate
A reference page should be indexable only when it is useful on its own.

- It needs original guidance, not only a rewritten source summary.
- It needs a real thumbnail or a deliberate branded fallback image.
- It needs internal links to related DesignMD guides or reference pages.
- It needs a source link so readers can verify the external workflow.
- It should avoid thin repeated language across many tools.
- If any of those pieces are missing, keep the page noindex and out of sitemap until fixed.

## Thumbnail guidance
The thumbnail should help a reader understand the source before clicking.

- Prefer a clean screenshot of the official page, documentation page, or repository.
- For GitHub pages, capture the repository header and README area, not a blank chrome frame.
- For app builders, capture the product surface or prompt area when publicly accessible.
- For abstract references, use a consistent DesignMD OG-style card with the tool name and category.
- Store final images in the DesignMD R2 thumbnail path so cards do not depend on third-party screenshot services.
- Check that the URL returns HTTP 200 before marking the entry ready for indexing.

## Maintenance rules
Reference pages age faster than brand pages because tools and docs change.

- Re-check official docs before changing claims about supported features.
- Prefer stable workflow advice over fragile pricing, plan, or model details.
- Do not mention a temporary beta label unless the source page still says it.
- Keep prompts vendor-specific only where the workflow really differs.
- If the tool changes substantially, update the source notes and last-reviewed context.
- If the source disappears, either replace it with a better source or noindex the page.

## Related
- [shadcn/ui DESIGN.md starter](/p/shadcnui-design-md-starter)
- [DESIGN.md for shadcn/ui](/guides/design-md-for-shadcn)
- [DESIGN.md for Tailwind](/guides/design-md-for-tailwind)
- [Tailwind DESIGN.md template](/p/tailwind-designmd-template)
- [Vercel DESIGN.md](/p/vercel-design-md)
- [v0 DESIGN.md](/p/v0-design-md)

## Source notes
- shadcn/ui gives component ownership; DESIGN.md gives product taste.
- The best workflow checks existing local components first.
- Component defaults should be adapted to the product system.
- Source: [shadcn/ui component documentation](https://ui.shadcn.com/docs/components)

## Copyable handoff
Use this short handoff when assigning UI work to an agent:

```text
Before editing UI, read DESIGN.md and the product component docs. Keep the existing stack and component system. Preserve the public copy unless the task asks for copy changes. When done, verify desktop and mobile screenshots, then report which visual rules were applied.
```