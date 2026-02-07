# Product Requirements Document: Hosted DB & UI

## Overview

Create a public, read-only web UI to display tweets stored in a production PostgreSQL database. The existing X Pipeline CLI ingests tweets into a local PostgreSQL database; this feature migrates that data to a hosted database (Neon) and provides a Next.js frontend to browse the content.

## Goals

1. **Host data in production**: Migrate from local Docker-based PostgreSQL to Neon (hosted PostgreSQL)
2. **Build a simple UI**: Create a Next.js application that displays tweets and their metrics
3. **Public access**: No authentication required - anyone can view the data

## Non-Goals

- Triggering ingestion from the UI (CLI remains the ingestion method)
- User authentication or access control
- Managing tracked accounts or date ranges from the UI
- Real-time updates or websocket connections
- Media file hosting (URLs point to original X/Twitter CDN)

## User Stories

### Viewer
- **As a visitor**, I want to see a list of tweets so I can browse the ingested content
- **As a visitor**, I want to see tweet metrics (likes, retweets, replies, etc.) so I can understand engagement
- **As a visitor**, I want to filter tweets by author so I can focus on specific accounts
- **As a visitor**, I want to search tweets by text content so I can find specific topics
- **As a visitor**, I want to sort tweets by date or engagement metrics so I can find popular or recent content
- **As a visitor**, I want to see media attachments (images) associated with tweets

## Functional Requirements

### Database Migration

| ID | Requirement |
|----|-------------|
| DB-1 | Configure Neon PostgreSQL as the production database |
| DB-2 | Existing schema (tweets, tweet_media, schema_migrations) must work unchanged |
| DB-3 | Update CLI configuration to support Neon connection string |
| DB-4 | Document migration steps for moving existing data to Neon |

### Web UI

| ID | Requirement |
|----|-------------|
| UI-1 | Display tweets in a paginated list (server-side rendered) |
| UI-2 | Show tweet text, author, creation date, and engagement metrics |
| UI-3 | Display media thumbnails for tweets with attachments |
| UI-4 | Filter tweets by author (dropdown or similar) |
| UI-5 | Search tweets by text content |
| UI-6 | Sort tweets by date (newest/oldest) or by engagement (most liked, most retweeted) |
| UI-7 | Responsive design - works on desktop and mobile |
| UI-8 | Clean, readable typography suitable for text-heavy content |

### Performance

| ID | Requirement |
|----|-------------|
| PF-1 | Initial page load under 3 seconds on typical connection |
| PF-2 | Pagination to limit data transfer (e.g., 20-50 tweets per page) |
| PF-3 | Server-side rendering for fast initial paint and SEO |

## Technical Decisions

### Database: Neon PostgreSQL
- **Why**: Pure PostgreSQL, generous free tier, simple connection string setup
- **Alternative considered**: Supabase (adds unnecessary features for read-only use case)

### Frontend: Next.js (App Router)
- **Why**: React with SSR, good developer experience, handles both API and UI
- **Version**: Latest stable (15.x)
- **Rendering**: Server components for data fetching, client components for interactivity

### Deployment
- **UI Hosting**: Vercel (natural fit for Next.js, free tier available)
- **Database**: Neon free tier

### Project Structure
The Next.js app will be added as a new directory within the existing project:
```
/
├── src/                    # Existing CLI code
├── ui/                     # New Next.js application
│   ├── app/
│   ├── components/
│   └── ...
├── package.json            # Existing CLI package
└── ...
```

This keeps the CLI and UI separate while sharing the same repository.

## Data Model

The UI reads from existing tables (no schema changes required):

### tweets
| Column | Type | UI Usage |
|--------|------|----------|
| tweet_id | TEXT | Link identifier |
| author_id | TEXT | Author filter |
| text | TEXT | Main content display |
| created_at | TIMESTAMPTZ | Date display, sorting |
| retweet_count | INTEGER | Metric display, sorting |
| reply_count | INTEGER | Metric display |
| like_count | INTEGER | Metric display, sorting |
| quote_count | INTEGER | Metric display |
| impression_count | INTEGER | Metric display |

### tweet_media
| Column | Type | UI Usage |
|--------|------|----------|
| tweet_id | TEXT | Join to tweets |
| type | TEXT | Render appropriate media type |
| url | TEXT | Media source |
| preview_image_url | TEXT | Thumbnail display |

## UI Wireframe (Conceptual)

```
┌─────────────────────────────────────────────────────────────┐
│  X Pipeline Viewer                                          │
├─────────────────────────────────────────────────────────────┤
│  [Search tweets...]           [Author ▼]  [Sort by: Date ▼] │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │ @username · Jan 15, 2025                                ││
│  │                                                         ││
│  │ Tweet text content goes here...                         ││
│  │                                                         ││
│  │ [image thumbnail]                                       ││
│  │                                                         ││
│  │ ♥ 1.2K  🔁 342  💬 89  👁 45K                           ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │ @username · Jan 14, 2025                                ││
│  │ ...                                                     ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  [← Previous]                              [Next →]         │
└─────────────────────────────────────────────────────────────┘
```

## Success Criteria

1. Neon database configured and accessible via connection string
2. Existing CLI can ingest to Neon (by updating DATABASE_URL)
3. Next.js app deployed to Vercel (or similar)
4. Users can browse, search, filter, and sort tweets
5. Page loads are fast (< 3 seconds)
6. UI is responsive on mobile devices

## Open Questions (Resolved)

| Question | Resolution |
|----------|------------|
| Which hosted DB? | Neon - simpler, pure PostgreSQL |
| Frontend framework? | Next.js with App Router |
| Authentication? | None - public access |
| UI scope? | View-only, no ingestion triggers |

## Future Considerations (Out of Scope)

These may be considered for future iterations but are explicitly excluded from this version:
- User accounts and saved searches
- Real-time updates when new tweets are ingested
- Export functionality (CSV, JSON)
- Analytics dashboard with charts
- Ingestion management from UI
