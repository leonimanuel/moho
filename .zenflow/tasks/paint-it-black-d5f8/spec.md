# Technical Specification: Paint It Black (Dark Theme)

## Difficulty: Easy

Straightforward CSS and JSX changes — no logic, no data model changes, no new components.

---

## Technical Context

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 via `@tailwindcss/postcss`
- **Dark mode current state**: Activated only via `@media (prefers-color-scheme: dark)` in `globals.css`
- **Goal**: Force dark theme unconditionally regardless of OS preference

### Tailwind v4 Dark Mode

In Tailwind v4, the dark mode variant is media-based by default. To switch to class-based dark mode, add this directive to the CSS:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

This makes all `dark:` utility classes activate whenever any ancestor element has the `dark` class.

---

## Implementation Approach

Two files need to change:

### 1. `ui/app/globals.css`

- **Remove** the `@media (prefers-color-scheme: dark)` block
- **Set** dark color values unconditionally in `:root`
- **Add** `@custom-variant dark (&:where(.dark, .dark *));` so Tailwind `dark:` classes work via the `dark` class on `<html>`

### 2. `ui/app/layout.tsx`

- Add `className="dark"` to the `<html>` element so all `dark:` Tailwind variants are permanently active

---

## Source Code Changes

| File | Change |
|------|--------|
| `ui/app/globals.css` | Remove media query block; set dark values in `:root`; add `@custom-variant dark` directive |
| `ui/app/layout.tsx` | Add `className="dark"` to `<html>` |

No new files. No deletions.

---

## Data Model / API / Interface Changes

None.

---

## Verification Approach

```bash
cd ui && npm run lint
cd ui && npm run build
```

Manual: Open the app in a browser with OS set to light mode — should display dark background (`#0a0a0a`) with light text (`#ededed`).
