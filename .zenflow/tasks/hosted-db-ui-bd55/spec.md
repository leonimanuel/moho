# Technical Specification: Hosted DB & UI

## Technical Context

### Existing Stack
- **Language**: TypeScript 5.7 (ES2022, Node16 modules)
- **Runtime**: Node.js >= 18
- **Database**: PostgreSQL 16 (currently Docker-based local)
- **Package Manager**: npm
- **Key Dependencies**: `postgres` (v3.4.5), `commander` (v12.1.0)
- **Testing**: Vitest 2.1.0
- **Build**: TSX for development, TypeScript compiler

### New Dependencies (UI)
- **Next.js 15.x** - React framework with App Router
- **React 19** - UI library (comes with Next.js 15)
- **Tailwind CSS 4.x** - Utility-first styling
- **postgres** - Reuse existing PostgreSQL client (shared with CLI)

### Deployment Target
- **UI**: Vercel (free tier)
- **Database**: Neon PostgreSQL (free tier)

---

## Implementation Approach

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Repository                               │
├─────────────────────┬───────────────────────────────────────────┤
│     /src (CLI)      │              /ui (Next.js)                │
│                     │                                           │
│  - Ingestion logic  │  /app                                     │
│  - X API client     │    - page.tsx (tweets list)               │
│  - DB migrations    │    - layout.tsx                           │
│                     │  /components                              │
│                     │    - TweetCard.tsx                        │
│                     │    - SearchBar.tsx                        │
│                     │    - Filters.tsx                          │
│                     │    - Pagination.tsx                       │
│                     │  /lib                                     │
│                     │    - db.ts (database queries)             │
│                     │                                           │
├─────────────────────┴───────────────────────────────────────────┤
│                     Neon PostgreSQL                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐   │
│  │     tweets     │  │  tweet_media   │  │schema_migrations │   │
│  └────────────────┘  └────────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Separate UI directory**: The Next.js app lives in `/ui` to keep clear separation from the CLI code in `/src`. They share the same repository but are independently deployable.

2. **Server Components by default**: All tweet data fetching happens in React Server Components. This provides:
   - No client-side JavaScript for initial render
   - Direct database access without API layer
   - Fast Time to First Byte (TTFB)

3. **Client Components for interactivity**: Search, filter, and sort controls use client components with URL-based state (searchParams) to maintain SSR benefits while enabling interactivity.

4. **Shared database client**: The `postgres` library is already used by the CLI. The UI will use the same library for consistency.

5. **URL-based state**: All filters, search, sort, and pagination state lives in URL query parameters. This enables:
   - Shareable URLs
   - Browser back/forward navigation
   - Full SSR on each navigation

---

## Source Code Structure Changes

### New Directory: `/ui`

```
/ui
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main tweets list page
│   ├── loading.tsx         # Loading skeleton
│   ├── error.tsx           # Error boundary
│   └── globals.css         # Tailwind imports
├── components/
│   ├── TweetCard.tsx       # Individual tweet display
│   ├── TweetMetrics.tsx    # Engagement metrics row
│   ├── MediaGallery.tsx    # Media thumbnails
│   ├── SearchBar.tsx       # Text search input
│   ├── AuthorFilter.tsx    # Author dropdown
│   ├── SortSelect.tsx      # Sort order dropdown
│   └── Pagination.tsx      # Page navigation
├── lib/
│   ├── db.ts               # Database connection and queries
│   └── types.ts            # TypeScript interfaces
├── package.json            # UI-specific dependencies
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind configuration
├── postcss.config.mjs      # PostCSS for Tailwind
└── tsconfig.json           # TypeScript config (extends root)
```

### Root-Level Changes

```
/ (repository root)
├── .env.example            # Add DATABASE_URL example
├── README.md               # Update with UI documentation
└── (no changes to /src)    # CLI code unchanged
```

---

## Data Model / API / Interface Changes

### Database Schema
**No changes required.** The existing `tweets` and `tweet_media` tables support all UI requirements.

### Database Queries

The UI needs these read-only queries:

```typescript
// lib/db.ts

interface TweetWithMedia {
  tweet_id: string;
  author_id: string;
  text: string;
  created_at: Date;
  retweet_count: number;
  reply_count: number;
  like_count: number;
  quote_count: number;
  impression_count: number;
  media: Array<{
    type: string;
    url: string;
    preview_image_url: string | null;
  }>;
}

interface TweetsQueryParams {
  search?: string;
  author?: string;
  sortBy: 'created_at' | 'like_count' | 'retweet_count';
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

// Query 1: Get paginated tweets with filters
async function getTweets(params: TweetsQueryParams): Promise<{
  tweets: TweetWithMedia[];
  total: number;
}>

// Query 2: Get distinct authors for filter dropdown
async function getAuthors(): Promise<string[]>
```

### API Routes
**None.** All data fetching happens via Server Components with direct database access. No REST/GraphQL API is needed.

---

## Delivery Phases

### Phase 1: Project Setup & Database Migration
Set up Neon database, Next.js project structure, and verify CLI can write to Neon.

**Deliverables:**
- Neon project created and connection string obtained
- `/ui` directory with Next.js 15 + Tailwind CSS initialized
- Database connection module (`/ui/lib/db.ts`)
- CLI tested against Neon (update `.env` documentation)
- Basic "Hello World" page renders

**Verification:**
- `npm run dev` in `/ui` starts dev server
- Database connection test passes
- CLI can ingest tweets to Neon

### Phase 2: Tweet Display (Read-Only)
Implement the core tweet list with pagination.

**Deliverables:**
- `TweetCard` component with text, author, date, metrics
- `TweetMetrics` component for engagement display
- `MediaGallery` component for thumbnail display
- Main page with paginated tweet list
- `Pagination` component with previous/next navigation
- Loading and error states

**Verification:**
- Page displays tweets from database
- Pagination navigates between pages
- Media thumbnails display correctly
- Loading skeleton shows during data fetch

### Phase 3: Search, Filter, and Sort
Add interactivity for finding specific content.

**Deliverables:**
- `SearchBar` component with debounced text input
- `AuthorFilter` dropdown populated from database
- `SortSelect` for date/engagement sorting
- URL-based state management for all controls

**Verification:**
- Search filters tweets by text content
- Author dropdown filters by author_id
- Sort changes order of results
- URL updates reflect current state
- Browser back/forward works correctly

### Phase 4: Polish & Deployment
Final styling, responsiveness, and production deployment.

**Deliverables:**
- Responsive layout (mobile + desktop)
- Typography and spacing refinements
- Vercel deployment configuration
- Environment variable documentation
- README update with deployment instructions

**Verification:**
- UI renders correctly on mobile viewport
- Vercel deployment succeeds
- Production site loads under 3 seconds
- All features work in production

---

## Verification Approach

### Type Checking
```bash
cd ui && npx tsc --noEmit
```

### Linting
```bash
cd ui && npm run lint
```
(Next.js includes ESLint configuration by default)

### Build Verification
```bash
cd ui && npm run build
```

### Manual Testing Checklist
- [ ] Page loads with tweets from database
- [ ] Pagination navigates correctly
- [ ] Search filters by text content
- [ ] Author filter limits to selected author
- [ ] Sort changes result ordering
- [ ] Media thumbnails display
- [ ] Mobile layout is usable
- [ ] Page load time < 3 seconds

### Database Connection Test
```typescript
// Run from /ui directory
import { sql } from './lib/db';
const result = await sql`SELECT COUNT(*) FROM tweets`;
console.log('Tweet count:', result[0].count);
```

---

## Configuration

### Environment Variables

**For UI (`/ui/.env.local`):**
```
DATABASE_URL=postgres://user:pass@host.neon.tech/dbname?sslmode=require
```

**For CLI (existing `/src`):**
```
DATABASE_URL=postgres://user:pass@host.neon.tech/dbname?sslmode=require
X_BEARER_TOKEN=...
```

Both CLI and UI share the same `DATABASE_URL` pointing to Neon.

### Neon-Specific Configuration

Neon requires SSL connections. The connection string must include `?sslmode=require`.

The `postgres` library handles this automatically when the connection string includes the SSL mode parameter.

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Neon cold starts slow | Medium | Medium | Use Neon's connection pooling; consider serverless driver |
| Large dataset pagination slow | Low | Medium | Existing indexes on `created_at` and `author_id` should suffice |
| X CDN blocks external referrers | Low | Low | Use `<img>` with referrerPolicy="no-referrer" |
| Tailwind CSS v4 breaking changes | Low | Low | Pin to specific version; follow migration guide |

---

## Out of Scope

Explicitly excluded from this specification:

- Authentication / authorization
- Write operations from UI
- Real-time updates
- Analytics charts
- Export functionality
- Ingestion management
- Unit/integration tests for UI (can be added later)
