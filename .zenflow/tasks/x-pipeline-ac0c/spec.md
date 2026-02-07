# X Pipeline - Technical Specification

## Technical Context

- **Language**: TypeScript (Node.js)
- **Runtime**: Node.js 20+
- **Package Manager**: npm
- **Key Dependencies**:
  - `postgres` (porsager/postgres) — lightweight, modern Postgres client for Node.js
  - `commander` — CLI argument parsing
  - `tsx` — TypeScript execution without a build step
- **Dev Dependencies**:
  - `typescript` — type checking
  - `vitest` — testing
  - `@types/node`
- **No ORM**: Raw SQL via `postgres` for full control over upserts, migrations, and batching.

## Implementation Approach

### Project Structure

```
x-pipeline/
├── package.json
├── tsconfig.json
├── .gitignore
├── src/
│   ├── main.ts              # Entry point: parse CLI args, orchestrate pipeline
│   ├── cli.ts               # CLI argument parsing with commander
│   ├── config.ts            # Environment variable and CLI config resolution
│   ├── db/
│   │   ├── client.ts        # Postgres connection setup
│   │   ├── migrate.ts       # Schema migration runner
│   │   └── migrations/
│   │       └── 001_create_tables.sql
│   ├── api/
│   │   ├── x-client.ts      # X API v2 HTTP client (fetch-based)
│   │   └── types.ts         # X API response types
│   ├── ingestion/
│   │   ├── pipeline.ts      # Main pipeline: paginate → transform → upsert loop
│   │   └── transform.ts     # Transform API responses to DB row format
│   └── logger.ts            # Simple console logger with progress formatting
├── tests/
│   ├── transform.test.ts    # Unit tests for data transformation
│   ├── pipeline.test.ts     # Unit tests for pipeline logic (mocked API/DB)
│   └── cli.test.ts          # CLI argument parsing tests
```

### Architectural Decisions

1. **No build step**: Use `tsx` to run TypeScript directly. Keeps the tool simple — it's a CLI, not a library.
2. **Native `fetch`**: Node.js 20+ provides global `fetch`. No HTTP library needed.
3. **Stream-style processing**: Each page of results is fetched, transformed, and upserted before fetching the next page. No in-memory accumulation of all tweets.
4. **SQL migrations**: Plain `.sql` files executed in order. A `schema_migrations` table tracks which migrations have run.
5. **Dependency injection for testability**: The pipeline function accepts API client and DB client interfaces, allowing mocking in tests.

## Source Code Structure Changes

This is a greenfield project. All files are new.

### `src/cli.ts`
- Uses `commander` to define `--username`, `--user-id`, `--start-date`, `--end-date`, `--database-url` options.
- Validates that either `--username` or `--user-id` is provided.
- Validates date format (ISO 8601).
- Returns a typed config object.

### `src/config.ts`
- Merges CLI args with environment variables (`X_BEARER_TOKEN`, `DATABASE_URL`).
- Validates all required values are present; exits with clear error if not.
- Exports a `Config` type.

### `src/db/client.ts`
- Creates a `postgres` connection using the connection string from config.
- Exports the `sql` tagged template instance.
- Provides a `disconnect()` function for clean shutdown.

### `src/db/migrate.ts`
- Reads `.sql` files from the `migrations/` directory, ordered by filename.
- Creates a `schema_migrations` table if it doesn't exist.
- Executes each unapplied migration inside a transaction.
- Logs each migration applied.

### `src/db/migrations/001_create_tables.sql`
- Creates `tweets` table per the data model in requirements.
- Creates `tweet_media` table with FK to `tweets.tweet_id`.
- Adds index on `tweets.author_id` and `tweets.created_at`.
- Uses `IF NOT EXISTS` for safety.

### `src/api/x-client.ts`
- `XClient` class initialized with bearer token.
- `getUserIdByUsername(username: string): Promise<string>` — resolves username to user ID via `GET /2/users/by/username/:username`.
- `searchTweets(params: SearchParams): Promise<SearchResponse>` — calls `GET /2/tweets/search/all` with query, date range, tweet fields, expansions, media fields, and optional `next_token`.
- Rate-limit handling:
  - On 429 response, read `x-rate-limit-reset` header.
  - Calculate sleep duration, log it, and `await` a timer.
  - Retry the same request after sleeping.
- On 401/403, throw an unrecoverable error with a clear message.
- Max results per page: `500` (API maximum for full-archive search).

### `src/api/types.ts`
- TypeScript interfaces for X API v2 responses: `TweetData`, `MediaData`, `SearchResponse`, `Includes`, etc.

### `src/ingestion/transform.ts`
- `transformTweet(tweet: TweetData, mediaMap: Map<string, MediaData>): TweetRow` — maps API fields to DB columns.
- `transformMedia(tweet: TweetData, mediaMap: Map<string, MediaData>): TweetMediaRow[]` — extracts media rows for a tweet.
- Handles nullable fields (referenced_tweets, attachments).
- Extracts only the first referenced tweet per requirements.

### `src/ingestion/pipeline.ts`
- `runPipeline(config, xClient, sql)` — main loop:
  1. If username provided, resolve to user ID.
  2. Build search query: `from:<username>`.
  3. Loop:
     a. Call `searchTweets` with current `next_token`.
     b. Build media key → media data map from `includes.media`.
     c. Transform each tweet and its media.
     d. Upsert batch of tweets using `INSERT ... ON CONFLICT (tweet_id) DO UPDATE`.
     e. Upsert batch of media using `INSERT ... ON CONFLICT (tweet_id, media_key) DO UPDATE`.
     f. Log progress (total tweets fetched, page count).
     g. If `next_token` exists, continue; otherwise break.
  4. Log final summary.

### `src/logger.ts`
- `logProgress(count, totalSoFar)` — e.g., "Fetched 500 tweets (1,500 total)..."
- `logRateLimit(resetTime)` — e.g., "Rate limited. Pausing until 10:32:15..."
- `logError(msg)` — prefixed error output.
- `logComplete(total)` — final summary.

### `src/main.ts`
- Parse CLI args.
- Resolve config.
- Connect to DB, run migrations.
- Create X API client.
- Run pipeline.
- Disconnect DB, exit.

## Data Model

As defined in the requirements. Additional details:

### `tweet_media` Unique Constraint
- Add `UNIQUE (tweet_id, media_key)` to support upsert semantics on media rows as well.

### Indexes
- `CREATE INDEX idx_tweets_author_id ON tweets (author_id);`
- `CREATE INDEX idx_tweets_created_at ON tweets (created_at);`
- `CREATE INDEX idx_tweet_media_tweet_id ON tweet_media (tweet_id);`

## API Integration Details

### Full-Archive Search Endpoint

```
GET https://api.x.com/2/tweets/search/all
```

**Query parameters:**
- `query`: `from:StateDept` (constructed from username/user ID)
- `start_time`: ISO 8601 datetime (e.g., `2021-01-01T00:00:00Z`)
- `end_time`: ISO 8601 datetime (e.g., `2025-01-01T00:00:00Z`)
- `max_results`: `500`
- `tweet.fields`: `id,text,created_at,author_id,public_metrics,attachments,referenced_tweets,conversation_id,lang`
- `expansions`: `attachments.media_keys`
- `media.fields`: `url,preview_image_url,type`
- `next_token`: pagination token from previous response

**Headers:**
- `Authorization: Bearer <X_BEARER_TOKEN>`

### Rate Limits
- Full-archive search: 300 requests per 15 minutes (Academic) or 1 request per second (Pro).
- On 429: read `x-rate-limit-reset` (Unix epoch seconds), sleep until that time + 1s buffer.

### Username Resolution

```
GET https://api.x.com/2/users/by/username/:username
```

Returns user ID needed for query construction. Only called if `--username` is provided instead of `--user-id`.

## Delivery Phases

### Phase 1: Project Setup & Database
- Initialize npm project, TypeScript config, `.gitignore`.
- Set up `postgres` client and migration runner.
- Create initial migration with `tweets` and `tweet_media` tables.
- Tests: migration runner unit tests with mocked SQL.

### Phase 2: X API Client
- Implement `XClient` with `searchTweets` and `getUserIdByUsername`.
- Implement rate-limit detection and retry logic.
- Implement unrecoverable error handling (401, 403).
- Tests: unit tests with mocked fetch for normal responses, pagination, rate limits, and errors.

### Phase 3: Data Transformation & Ingestion Pipeline
- Implement `transform.ts` functions.
- Implement `pipeline.ts` page-fetch-transform-upsert loop.
- Implement progress logging.
- Tests: transform unit tests, pipeline unit tests with mocked API and DB.

### Phase 4: CLI & Main Entry Point
- Implement CLI argument parsing with `commander`.
- Implement `config.ts` for environment/CLI merging.
- Wire everything together in `main.ts`.
- Tests: CLI parsing tests.

## Verification Approach

- **Lint**: `npx tsc --noEmit` (type checking)
- **Test**: `npx vitest run`
- **Manual integration test**: Run against a real Postgres instance and X API with a small date range to verify end-to-end flow.
- Each phase should pass `tsc --noEmit` and `vitest run` before proceeding to the next.
