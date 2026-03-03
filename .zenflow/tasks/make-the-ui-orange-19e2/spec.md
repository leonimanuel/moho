# Technical Specification: Make the UI Orange

## Difficulty Assessment
**Easy** — Straightforward color scheme change across CSS variables and Tailwind utility classes.

---

## Technical Context

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss"` in `globals.css`)
- **Language**: TypeScript
- **Color system**: Tailwind utility classes with `zinc` as the neutral palette; `blue` for interactive focus states; CSS custom properties for background/foreground in `globals.css`

---

## Implementation Approach

Replace the neutral `zinc` color palette with Tailwind's `orange` palette throughout all UI components, and update `blue` focus/accent colors to `orange`. This creates an orange-themed UI while maintaining the same structural layout and dark mode support.

The changes are purely cosmetic — no logic, data model, API, or interface changes are needed.

### Color Mapping

| Current | Replacement |
|---|---|
| `zinc-50` (page bg) | `orange-50` |
| `zinc-100` | `orange-100` |
| `zinc-200` | `orange-200` |
| `zinc-300` | `orange-300` |
| `zinc-400` | `orange-400` |
| `zinc-500` | `orange-500` |
| `zinc-600` | `orange-600` |
| `zinc-700` | `orange-700` |
| `zinc-800` | `orange-800` |
| `zinc-900` | `orange-900` |
| `zinc-950` | `orange-950` |
| `blue-400/500` (focus rings) | `orange-400/500` |
| `black` (dark bg) | `orange-950` |
| `white` (light bg) | `white` (keep) |
| CSS `--background: #ffffff` | `--background: #fff7ed` (orange-50) |
| CSS `--background: #0a0a0a` (dark) | `--background: #1c0a00` (deep orange-dark) |

---

## Source Code Files to Modify

1. **`ui/app/globals.css`** — Update CSS custom properties `--background` to orange tones
2. **`ui/app/page.tsx`** — Replace `zinc-*` classes with `orange-*`; `black` → `orange-950`
3. **`ui/components/TweetCard.tsx`** — Replace `zinc-*` with `orange-*`
4. **`ui/components/TweetMetrics.tsx`** — Replace `zinc-*` with `orange-*`
5. **`ui/components/SearchBar.tsx`** — Replace `zinc-*` and `blue-*` with `orange-*`
6. **`ui/components/Pagination.tsx`** — Replace `zinc-*` with `orange-*`
7. **`ui/components/AuthorFilter.tsx`** — Replace `zinc-*` and `blue-*` with `orange-*`
8. **`ui/components/SortSelect.tsx`** — Replace `zinc-*` and `blue-*` with `orange-*`

No new files need to be created.

---

## Data Model / API / Interface Changes

None.

---

## Verification Approach

1. Run `cd ui && npm run lint` — ensure no ESLint errors introduced
2. Run `cd ui && npm run build` — ensure the Next.js build succeeds without TypeScript errors
3. Visual inspection: start dev server with `cd ui && npm run dev` and verify orange color scheme renders correctly in both light and dark mode
