# Technical Specification: Paint It Black

## Complexity Assessment
**Easy** — The UI already has full dark mode support via Tailwind `dark:` classes throughout all components. Dark mode is currently activated only when the OS prefers it. The fix is a 2-file change to force dark mode permanently.

## Technical Context
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss"` syntax in `globals.css`)
- **Dark mode strategy**: Currently `media` (system preference), needs to be switched to `class` strategy

## Current State
- `ui/app/globals.css` defines `--background: #ffffff` by default and overrides to `#0a0a0a` only inside `@media (prefers-color-scheme: dark)`
- `ui/app/layout.tsx` renders `<html lang="en">` with no `dark` class
- All components (TweetCard, SearchBar, Pagination, AuthorFilter, SortSelect, TweetMetrics, MediaGallery, page.tsx) already have `dark:` variant classes applied

## Implementation Approach

### 1. Switch Tailwind dark mode to class strategy (`ui/app/globals.css`)
Add the Tailwind v4 variant override before the existing rules:
```css
@variant dark (&:where(.dark, .dark *));
```
Also update `:root` to always use dark colors (remove dependency on the media query):
```css
:root {
  --background: #0a0a0a;
  --foreground: #ededed;
}
```
Remove the `@media (prefers-color-scheme: dark)` block since colors are now always dark.

### 2. Add `dark` class to `<html>` element (`ui/app/layout.tsx`)
```tsx
<html lang="en" className="dark">
```
This activates all `dark:` Tailwind utility classes unconditionally.

## Files Modified
| File | Change |
|---|---|
| `ui/app/globals.css` | Add `@variant dark` override, set dark CSS variables as default, remove media query |
| `ui/app/layout.tsx` | Add `className="dark"` to `<html>` element |

## Data Model / API / Interface Changes
None.

## Verification Approach
1. Run `cd ui && npm run build` — must pass with no errors
2. Run `cd ui && npm run lint` — must pass with no warnings
3. Start dev server `cd ui && npm run dev` and verify the UI renders with black background regardless of OS dark mode setting
