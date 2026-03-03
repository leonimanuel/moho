BRANCH: new-task-10f9

# PRD: Make it Purple

## Overview

Restyle the tweet browser UI from its current neutral zinc/white/black color scheme to a purple-themed design. The application is a Next.js 15 app using Tailwind CSS v4 in the `ui/` directory.

## Current State

The UI uses a neutral color palette throughout:
- **Backgrounds**: `zinc-50`, `white`, `zinc-950`, `black`
- **Borders**: `zinc-200`, `zinc-800`
- **Text**: `zinc-900`, `zinc-100`, `zinc-500`, `zinc-400`, `zinc-700`, `zinc-300`
- **Interactive elements**: `zinc-300` borders, `zinc-50`/`zinc-100` hover states
- **Dividers**: `zinc-200` / `zinc-800`

## Requirements

### Functional Requirements

1. Replace the neutral zinc color palette with purple equivalents across all UI components.
2. Maintain dark mode support — all purple replacements must include corresponding dark-mode variants.
3. Preserve the existing layout, spacing, typography, and responsive behavior — only colors change.
4. All interactive states (hover, active, focus) must also be updated to purple variants.

### Color Mapping

Replace zinc colors with Tailwind's `purple` palette at equivalent shade levels:

| Current (light) | Replacement (light) | Current (dark) | Replacement (dark) |
|---|---|---|---|
| `bg-zinc-50` | `bg-purple-50` | `dark:bg-black` | `dark:bg-purple-950` |
| `bg-white` | `bg-white` (keep) | `dark:bg-zinc-950` | `dark:bg-purple-950` |
| `border-zinc-200` | `border-purple-200` | `dark:border-zinc-800` | `dark:border-purple-800` |
| `text-zinc-900` | `text-purple-900` | `dark:text-zinc-100` | `dark:text-purple-100` |
| `text-zinc-500` / `zinc-400` | `text-purple-500` / `purple-400` | — | — |
| `text-zinc-700` / `zinc-300` | `text-purple-700` / `purple-300` | — | — |
| `bg-zinc-100` | `bg-purple-100` | `dark:bg-zinc-900` | `dark:bg-purple-900` |
| `hover:bg-zinc-50` | `hover:bg-purple-50` | `dark:hover:bg-zinc-800` | `dark:hover:bg-purple-800` |
| `divide-zinc-200` | `divide-purple-200` | `dark:divide-zinc-800` | `dark:divide-purple-800` |

Additionally, update `globals.css` CSS variables:
- `--background`: keep `#ffffff` for light / change dark to a deep purple (e.g. `#0d0010`)
- `--foreground`: keep `#171717` for light / dark can stay `#ededed` or shift to near-white

### Files to Update

- `ui/app/globals.css` — CSS variables for background/foreground
- `ui/app/page.tsx` — page-level background and container colors
- `ui/components/TweetCard.tsx` — border, text colors
- `ui/components/Pagination.tsx` — border, button, text colors
- `ui/components/SearchBar.tsx` — input styling
- `ui/components/AuthorFilter.tsx` — select styling
- `ui/components/SortSelect.tsx` — select styling
- `ui/components/TweetMetrics.tsx` — metric text/icon colors
- `ui/components/MediaGallery.tsx` — any background/border colors

### Out of Scope

- Changes to backend / API / ingestion pipeline code
- Layout or spacing changes
- Font changes
- Adding new UI components or features

## Assumptions

- "Make it purple" means applying Tailwind's built-in `purple` color scale (not a custom hex palette).
- White backgrounds in light mode can remain white; the purple theming is most visible in borders, text, hover states, and dark-mode surfaces.
- No specific shade of purple was requested; standard Tailwind purple scale shades matching current zinc shade levels are appropriate.
