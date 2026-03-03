# Product Requirements Document: Make the UI Turquoise

**BRANCH:** make-the-ui-turquoise-0cc1

## Overview

Update the UI color scheme to use turquoise as the primary accent color instead of the current blue accent.

## Current State

The application is a Next.js 16 + React 19 web app using Tailwind CSS v4 for styling. The current color scheme consists of:

- **Accent colors**: Blue (`blue-500`, `blue-400`) for interactive elements like focus states, input borders, and loading spinners
- **Neutral palette**: Zinc grays for backgrounds, text, and borders
- **Dark mode support**: Via `prefers-color-scheme` media query

### Files with color styling:
- `ui/app/globals.css` - CSS custom properties and Tailwind theme configuration
- `ui/app/page.tsx` - Main page layout
- `ui/components/SearchBar.tsx` - Search input with blue focus states
- `ui/components/Pagination.tsx` - Navigation buttons
- `ui/components/AuthorFilter.tsx` - Author dropdown
- `ui/components/SortSelect.tsx` - Sort dropdown
- `ui/components/TweetCard.tsx` - Tweet display cards
- `ui/components/TweetMetrics.tsx` - Engagement metrics
- `ui/components/MediaGallery.tsx` - Media display

## Requirements

### Functional Requirements

1. **Replace blue accent with teal (turquoise)**
   - All instances of `blue-500` should be replaced with `teal-500`
   - All instances of `blue-400` should be replaced with `teal-400`
   - This affects focus states, rings, borders, and any other blue accent usage

2. **Maintain existing color patterns**
   - The zinc neutral palette for backgrounds, text, and borders remains unchanged
   - Dark mode behavior and patterns remain the same
   - Only the accent color changes from blue to teal

3. **Consistency across all components**
   - All interactive elements should use the same teal accent
   - Focus states, hover states, and active states should all use teal variants

### Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Turquoise shade | Tailwind's `teal` color | `teal` is the classic turquoise shade; `cyan` is more blue-green. Teal provides the traditional turquoise appearance. |
| Neutral palette | Keep zinc unchanged | Zinc grays provide excellent contrast with teal and maintain readability. No need to change. |
| Scope | Accent colors only | Changing only accent colors keeps the change focused and maintainable. Background and text colors work well as-is. |

### Non-Functional Requirements

1. **No visual regression** - All components should render correctly after the change
2. **Accessibility** - Teal colors must maintain sufficient contrast ratios (teal-500/400 meet WCAG standards similar to blue-500/400)
3. **Dark mode parity** - Both light and dark modes should have consistent turquoise theming

## Out of Scope

- Adding new turquoise shades beyond what Tailwind provides by default
- Changing the neutral color palette (zinc/gray)
- Creating a comprehensive theming system or design tokens
- Adding theme switching functionality

## Implementation Notes

The implementation is straightforward: search and replace blue color classes with teal equivalents across all component files. The files to modify are:
- Any component using `blue-500` → `teal-500`
- Any component using `blue-400` → `teal-400`

No configuration changes to Tailwind are required as `teal` is a built-in color in Tailwind's default palette.
