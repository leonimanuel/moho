# Full SDD workflow

## Configuration
- **Artifacts Path**: {@artifacts_path} → `.zenflow/tasks/{task_id}`

---

## Workflow Steps

### [x] Step: Requirements
<!-- chat-id: e0e9cc24-9d06-4d15-adb0-24c6b92a56ff -->

Create a Product Requirements Document (PRD) based on the feature description.

1. Review existing codebase to understand current architecture and patterns
2. Analyze the feature definition and identify unclear aspects
3. Ask the user for clarifications on aspects that significantly impact scope or user experience
4. Make reasonable decisions for minor details based on context and conventions
5. If user can't clarify, make a decision, state the assumption, and continue

Save the PRD to `{@artifacts_path}/requirements.md`.

### [x] Step: Technical Specification
<!-- chat-id: 919f83dc-6058-4390-86aa-8598d87d91ec -->

Create a technical specification based on the PRD in `{@artifacts_path}/requirements.md`.

1. Review existing codebase architecture and identify reusable components
2. Define the implementation approach

Save to `{@artifacts_path}/spec.md` with:
- Technical context (language, dependencies)
- Implementation approach referencing existing code patterns
- Source code structure changes
- Data model / API / interface changes
- Delivery phases (incremental, testable milestones)
- Verification approach using project lint/test commands

### [x] Step: Planning
<!-- chat-id: 61d26a0a-f447-4e3a-8736-debee7ebc640 -->

Create a detailed implementation plan based on `{@artifacts_path}/spec.md`.

1. Break down the work into concrete tasks
2. Each task should reference relevant contracts and include verification steps
3. Replace the Implementation step below with the planned tasks

Rule of thumb for step size: each step should represent a coherent unit of work (e.g., implement a component, add an API endpoint). Avoid steps that are too granular (single function) or too broad (entire feature).

Important: unit tests must be part of each implementation task, not separate tasks. Each task should implement the code and its tests together, if relevant.

If the feature is trivial and doesn't warrant full specification, update this workflow to remove unnecessary steps and explain the reasoning to the user.

Save to `{@artifacts_path}/plan.md`.

---

## Implementation Steps

### [ ] Step: Initialize Next.js Project

Set up the `/ui` directory with Next.js 15, React 19, and Tailwind CSS 4.

**Tasks:**
- Create `/ui` directory with `npx create-next-app@latest` (App Router, TypeScript, Tailwind, ESLint)
- Configure `tsconfig.json` to extend root config where appropriate
- Update root `.gitignore` to include Next.js artifacts (`.next/`, `ui/node_modules/`, etc.)
- Add placeholder `DATABASE_URL` to `.env.example` with Neon format
- Create basic `ui/lib/db.ts` with database connection using `postgres` library

**Verification:**
- `cd ui && npm run dev` starts successfully
- `cd ui && npm run build` completes without errors
- `cd ui && npx tsc --noEmit` passes

### [ ] Step: Database Queries Module

Implement the data access layer for fetching tweets and authors.

**Tasks:**
- Create `ui/lib/types.ts` with `TweetWithMedia` and `TweetsQueryParams` interfaces (per spec)
- Implement `getTweets(params)` function with:
  - Pagination (offset/limit)
  - Text search filter (SQL `ILIKE`)
  - Author filter
  - Sort by `created_at`, `like_count`, or `retweet_count`
  - Join with `tweet_media` to include media attachments
- Implement `getAuthors()` function to fetch distinct author IDs
- Add connection pooling configuration suitable for serverless (Neon)

**Verification:**
- `cd ui && npx tsc --noEmit` passes
- Manual test: Create a simple script or page that queries the database

### [ ] Step: Tweet Display Components

Build the core UI components for displaying tweets.

**Tasks:**
- Create `ui/components/TweetCard.tsx` - displays tweet text, author, date
- Create `ui/components/TweetMetrics.tsx` - displays like/retweet/reply/quote/impression counts
- Create `ui/components/MediaGallery.tsx` - displays media thumbnails with `referrerPolicy="no-referrer"`
- Style components with Tailwind CSS for clean, readable typography

**Verification:**
- `cd ui && npm run build` succeeds
- `cd ui && npm run lint` passes
- Components render correctly in browser (manual check with mock data)

### [ ] Step: Main Page with Pagination

Implement the main tweets list page with server-side rendering and pagination.

**Tasks:**
- Implement `ui/app/page.tsx` as Server Component that fetches tweets using `getTweets()`
- Add URL-based pagination via `searchParams` (e.g., `?page=2`)
- Create `ui/components/Pagination.tsx` with Previous/Next navigation
- Create `ui/app/loading.tsx` with loading skeleton
- Create `ui/app/error.tsx` with error boundary
- Configure page metadata in `ui/app/layout.tsx`

**Verification:**
- `cd ui && npm run build` succeeds
- Page displays tweets from database
- Pagination navigates between pages correctly
- Loading state appears during navigation

### [ ] Step: Search, Filter, and Sort Controls

Add interactive controls for finding specific content.

**Tasks:**
- Create `ui/components/SearchBar.tsx` - text input with debounced search, updates URL
- Create `ui/components/AuthorFilter.tsx` - dropdown populated by `getAuthors()`, updates URL
- Create `ui/components/SortSelect.tsx` - dropdown for sort field and order, updates URL
- Integrate controls into main page layout
- Ensure all state is URL-based (shareable links, browser back/forward works)

**Verification:**
- `cd ui && npm run build` succeeds
- `cd ui && npm run lint` passes
- Search filters tweets by text content
- Author dropdown filters by author
- Sort changes result ordering
- URL reflects current filter/sort state
- Browser back/forward navigates correctly

### [ ] Step: Responsive Design and Polish

Finalize styling for mobile and desktop viewports.

**Tasks:**
- Add responsive breakpoints to all components (mobile-first approach)
- Refine typography, spacing, and visual hierarchy
- Test and fix layout on mobile viewport (375px width)
- Test and fix layout on desktop viewport (1280px+ width)
- Ensure consistent visual appearance across components

**Verification:**
- `cd ui && npm run build` succeeds
- UI renders correctly on mobile viewport
- UI renders correctly on desktop viewport
- Typography is readable and consistent

### [ ] Step: Deployment Configuration

Prepare for Vercel deployment.

**Tasks:**
- Create `ui/vercel.json` if custom configuration needed (likely not required)
- Document environment variables in README.md:
  - `DATABASE_URL` - Neon connection string
- Add deployment instructions to README.md
- Verify build works with production settings

**Verification:**
- `cd ui && npm run build` succeeds with production environment
- README documents deployment steps
- Ready for Vercel deployment (user will deploy manually)
