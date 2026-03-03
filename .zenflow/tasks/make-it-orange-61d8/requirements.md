BRANCH: make-it-orange-61d8

# PRD: Make the UI Orange

## Overview

Restyle the tweet archive UI to use an orange color palette instead of the current blue/zinc scheme. The change is purely cosmetic — no functional behavior changes.

## Current State

The UI (`ui/`) is a Next.js 15 app using Tailwind CSS v4. It currently uses:
- **Background/surface colors**: `zinc-*` scale (zinc-50, zinc-100, zinc-200, zinc-800, zinc-900, zinc-950)
- **Text colors**: zinc scale
- **Accent/interactive color**: `blue-500` / `blue-400` (focus rings, borders, spinner)
- **CSS variables** in `globals.css`: `--background` (white/near-black) and `--foreground` (near-black/near-white)

## Requirements

### 1. Replace blue accent with orange

All interactive focus states, highlights, and accent colors that are currently `blue-*` should become `orange-*` equivalents:

| Current | Replace with |
|---------|-------------|
| `focus:border-blue-500` | `focus:border-orange-500` |
| `focus:ring-blue-500` | `focus:ring-orange-500` |
| `dark:focus:border-blue-400` | `dark:focus:border-orange-400` |
| `dark:focus:ring-blue-400` | `dark:focus:ring-orange-400` |
| `border-t-blue-500` (spinner) | `border-t-orange-500` |

Files to update: `ui/components/SearchBar.tsx`

### 2. Give the UI an orange feel throughout

Replace the neutral zinc palette with orange-tinted alternatives where visible:

- **Page background** (`bg-zinc-50` / `dark:bg-black` in `page.tsx`): change to `bg-orange-50` / `dark:bg-orange-950`
- **Card/container backgrounds** (`bg-white` / `dark:bg-zinc-950`): keep white in light mode; use `dark:bg-zinc-950` (keep) or `dark:bg-orange-950` — use `dark:bg-orange-950` for consistency
- **Borders** (`border-zinc-200` / `dark:border-zinc-800`): change to `border-orange-200` / `dark:border-orange-800`
- **Dividers** (`divide-zinc-200` / `dark:divide-zinc-800`): change to `divide-orange-200` / `dark:divide-orange-800`
- **Header**: Give the sticky header an orange tint — `bg-orange-50/95` (light) / `dark:bg-orange-950/95` (dark)
- **Heading text** (`text-zinc-900` / `dark:text-zinc-100`): keep black/white for readability — no change needed
- **Muted/secondary text** (`text-zinc-500`, `text-zinc-400`): change to `text-orange-600` / `dark:text-orange-400` for subtle warmth
- **Pagination buttons** (borders, backgrounds, hover states): replace zinc colors with orange equivalents
- **Disabled/inactive pagination** (`bg-zinc-100`, `text-zinc-400`): replace with `bg-orange-100`, `text-orange-300` etc.

Files to update: `ui/app/page.tsx`, `ui/components/Pagination.tsx`, `ui/components/TweetCard.tsx`, `ui/components/TweetMetrics.tsx`, `ui/components/SearchBar.tsx`, `ui/components/AuthorFilter.tsx`, `ui/components/SortSelect.tsx`

### 3. CSS variables in globals.css

No change needed to `--background` / `--foreground` as they are neutral. Optionally, we can leave globals.css as-is and rely on Tailwind classes.

## Assumptions

- **Scope is UI-only**: No backend, API, or data changes.
- **Dark mode**: Maintain dark mode support using orange dark variants (e.g., `orange-800`, `orange-900`, `orange-950`).
- **Text readability**: Main content text (tweet body, author names) stays dark/light neutral for readability — only accent, border, and background colors shift to orange.
- **No design system / token layer**: Changes are applied directly to Tailwind classes in each component file.
- **All files in `ui/components/` and `ui/app/` are in scope** for color changes.
