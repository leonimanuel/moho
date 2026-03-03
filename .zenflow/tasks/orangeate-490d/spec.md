# Technical Specification: Make the UI Orange

## Difficulty

**Easy** — Pure cosmetic/styling change. Replace Tailwind CSS color classes across UI component files. No logic, API, or data model changes.

## Technical Context

- **Framework**: Next.js 15 (App Router), React
- **Styling**: Tailwind CSS v4 (utility classes applied directly in JSX)
- **Dark mode**: Supported via `dark:` Tailwind variants
- **No design token layer** — colors are hardcoded as Tailwind classes

## Implementation Approach

Replace `zinc-*` neutral palette with `orange-*` equivalents and replace `blue-*` accent colors with `orange-*` equivalents across all UI component files. Changes are mechanical find-and-replace of class names guided by the mapping table below.

### Color Mapping

| Current class | Replacement |
|---|---|
| `bg-zinc-50` | `bg-orange-50` |
| `dark:bg-black` | `dark:bg-orange-950` |
| `dark:bg-zinc-950` | `dark:bg-orange-950` |
| `dark:bg-zinc-950/95` | `dark:bg-orange-950/95` |
| `bg-white/95` (header) | `bg-orange-50/95` |
| `border-zinc-200` | `border-orange-200` |
| `dark:border-zinc-800` | `dark:border-orange-800` |
| `divide-zinc-200` | `divide-orange-200` |
| `dark:divide-zinc-800` | `dark:divide-orange-800` |
| `text-zinc-500` | `text-orange-600` |
| `dark:text-zinc-400` (muted) | `dark:text-orange-400` |
| `focus:border-blue-500` | `focus:border-orange-500` |
| `focus:ring-blue-500` | `focus:ring-orange-500` |
| `dark:focus:border-blue-400` | `dark:focus:border-orange-400` |
| `dark:focus:ring-blue-400` | `dark:focus:ring-orange-400` |
| `border-t-blue-500` (spinner) | `border-t-orange-500` |
| `border-zinc-300` (inputs/buttons) | `border-orange-300` |
| `dark:border-zinc-700` (inputs) | `dark:border-orange-700` |
| `hover:bg-zinc-50` (buttons) | `hover:bg-orange-50` |
| `active:bg-zinc-100` (buttons) | `active:bg-orange-100` |
| `dark:hover:bg-zinc-800` (buttons) | `dark:hover:bg-orange-900` |
| `bg-zinc-100` (disabled) | `bg-orange-100` |
| `text-zinc-400` (disabled text) | `text-orange-300` |
| `dark:bg-zinc-900` (inputs/buttons) | `dark:bg-orange-950` |
| `text-zinc-700` (button text) | `text-orange-700` |
| `dark:text-zinc-300` (button text) | `dark:text-orange-300` |
| `dark:text-zinc-600` (disabled) | `dark:text-orange-700` |

### Preserved (no change)

- `text-zinc-900` / `dark:text-zinc-100` — main content text stays neutral for readability
- `text-zinc-800` / `dark:text-zinc-200` — tweet body text stays neutral
- `bg-white` (card/input backgrounds in light mode) — kept white
- `globals.css` CSS variables — no change needed

## Source Code Files to Modify

1. **`ui/app/page.tsx`**
   - Page wrapper: `bg-zinc-50` → `bg-orange-50`, `dark:bg-black` → `dark:bg-orange-950`
   - Card container: `dark:bg-zinc-950` → `dark:bg-orange-950`
   - Header: `bg-white/95` → `bg-orange-50/95`, `dark:bg-zinc-950/95` → `dark:bg-orange-950/95`, borders → orange
   - Controls section border → orange
   - Tweet list `divide-zinc-200` / `dark:divide-zinc-800` → orange
   - Empty state text `text-zinc-500 dark:text-zinc-400` → `text-orange-600 dark:text-orange-400`
   - Pagination wrapper border → orange
   - Subheading count text → orange muted

2. **`ui/components/SearchBar.tsx`**
   - Input: `focus:border-blue-500 focus:ring-blue-500` → orange equivalents
   - Input: `dark:focus:border-blue-400 dark:focus:ring-blue-400` → orange
   - Spinner: `border-t-blue-500` → `border-t-orange-500`

3. **`ui/components/Pagination.tsx`**
   - Active buttons: zinc borders/backgrounds/text → orange equivalents
   - Disabled spans: `bg-zinc-100 text-zinc-400` → `bg-orange-100 text-orange-300`
   - Nav border top: `border-zinc-200 dark:border-zinc-800` → orange
   - Page indicator muted text → orange
   - Page number bold text → keep zinc (readability)

4. **`ui/components/TweetCard.tsx`**
   - Article `border-zinc-200 dark:border-zinc-800` → `border-orange-200 dark:border-orange-800`
   - Date `text-zinc-500 dark:text-zinc-400` → `text-orange-600 dark:text-orange-400`

5. **`ui/components/TweetMetrics.tsx`**
   - `MetricItem` text: `text-zinc-500 dark:text-zinc-400` → `text-orange-600 dark:text-orange-400`

6. **`ui/components/AuthorFilter.tsx`**
   - Select: blue focus → orange focus; zinc border/bg → orange equivalents

7. **`ui/components/SortSelect.tsx`**
   - Select: blue focus → orange focus; zinc border/bg → orange equivalents

## Data Model / API / Interface Changes

None. This is UI-only.

## Verification Approach

```bash
cd ui
npm run build   # TypeScript compilation + Next.js build
npm run lint    # ESLint check
```

Manual visual check: run `npm run dev` and confirm the orange palette is applied in light and dark modes.
