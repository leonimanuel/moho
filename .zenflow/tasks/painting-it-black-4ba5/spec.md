# Technical Specification: Make the UI Always Black (Dark Theme)

## Difficulty
**Easy** — Two small file edits, no new dependencies.

## Technical Context
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS v4 (via `@import "tailwindcss"` + `@tailwindcss/postcss`)
- **Dark mode currently**: Activated only via `@media (prefers-color-scheme: dark)` in `globals.css`
- **Goal**: Force dark mode unconditionally

## Implementation Approach

Tailwind v4 uses the `media` strategy by default. To switch to class-based dark mode, add a `@variant` directive in CSS instead of a config file option (no `tailwind.config.js` exists in this project). Then:

1. Override `:root` CSS variables to always use dark values.
2. Add the `@variant dark` directive so Tailwind `dark:` classes respond to the `dark` class on `<html>`.
3. Add `className="dark"` to the `<html>` element in the layout.

## Files to Modify

### `ui/app/globals.css`
- Remove the `@media (prefers-color-scheme: dark)` block entirely.
- Set `--background: #0a0a0a` and `--foreground: #ededed` unconditionally in `:root`.
- Add Tailwind v4 class-strategy variant: `@variant dark (&:where(.dark, .dark *));`

### `ui/app/layout.tsx`
- Change `<html lang="en">` to `<html lang="en" className="dark">`.

## Data Model / API / Interface Changes
None.

## Verification Approach
1. Run `cd ui && npm run build` — must complete without errors.
2. Run `cd ui && npm run lint` — must pass.
3. Manual: open app in browser with OS set to light mode → background must be dark (`#0a0a0a`), text light (`#ededed`).
