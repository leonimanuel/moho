BRANCH: paint-it-black-7844

# PRD: Make the UI Black (Dark Theme)

## Summary

Force the tweet archive UI to always render in a dark/black theme, regardless of the user's OS color scheme preference.

## Background

The UI (`ui/`) is a Next.js app using Tailwind CSS. It already has full dark-mode styling via `dark:` Tailwind classes and CSS custom properties (`--background`, `--foreground`). Currently the dark theme only activates when the OS prefers dark mode (`@media (prefers-color-scheme: dark)`). The task is to make black the permanent, unconditional theme.

## Goals

- The UI is always rendered in the dark/black color scheme.
- No light-mode variant is shown under any circumstances.
- No user-facing theme toggle is needed.

## Non-Goals

- Adding a theme toggle or persisting user preference.
- Changing any colors beyond what the existing dark-mode palette already defines.

## Implementation Approach

**Assumption**: Tailwind is configured to use the `class` strategy for dark mode (or can be switched to it), meaning adding a `dark` class to `<html>` activates all `dark:` variants. This is the standard approach for forced dark mode in Next.js + Tailwind projects.

### Changes Required

1. **`ui/app/globals.css`** — Remove the `@media (prefers-color-scheme: dark)` block and apply the dark color values unconditionally in `:root`:
   ```css
   :root {
     --background: #0a0a0a;
     --foreground: #ededed;
   }
   ```

2. **`ui/app/layout.tsx`** — Add the `dark` class to the `<html>` element so all Tailwind `dark:` variants are always active:
   ```tsx
   <html lang="en" className="dark">
   ```

3. **Tailwind dark mode strategy** — Confirm or set `darkMode: 'class'` in Tailwind config. Since this project uses Tailwind v4 (via `@import "tailwindcss"` in globals.css and `postcss.config.mjs`), dark mode class strategy may need to be set via a `@variant` or config. Investigate and apply the appropriate config for Tailwind v4.

## Acceptance Criteria

- Opening the app in a browser (regardless of OS dark/light preference) shows a black/dark background with light text.
- No white or light-gray backgrounds appear anywhere in the UI.
- All existing `dark:` Tailwind classes render correctly.
