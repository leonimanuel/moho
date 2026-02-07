# Full SDD workflow

## Configuration
- **Artifacts Path**: {@artifacts_path} → `.zenflow/tasks/{task_id}`

---

## Workflow Steps

### [x] Step: Requirements
<!-- chat-id: 1f9b9803-cac7-488d-b950-6e01e301ca4e -->

Create a Product Requirements Document (PRD) based on the feature description.

1. Review existing codebase to understand current architecture and patterns
2. Analyze the feature definition and identify unclear aspects
3. Ask the user for clarifications on aspects that significantly impact scope or user experience
4. Make reasonable decisions for minor details based on context and conventions
5. If user can't clarify, make a decision, state the assumption, and continue

Save the PRD to `{@artifacts_path}/requirements.md`.

### [x] Step: Technical Specification
<!-- chat-id: ce98b3e2-60c5-4628-8662-16f18a44d25d -->

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
<!-- chat-id: 3bf2c7ea-2eec-4ddf-beee-bb7d1a1dd5f8 -->

Create a detailed implementation plan based on `{@artifacts_path}/spec.md`.

### [x] Step: Project Setup & Database Layer
<!-- chat-id: 283b5194-e252-4c94-ae98-c2cd215938c2 -->

Set up the project scaffolding and implement the full database layer including migrations.

- Initialize npm project with `package.json` (dependencies: `postgres`, `commander`; dev: `typescript`, `vitest`, `tsx`, `@types/node`)
- Create `tsconfig.json` with strict mode, ESM module resolution
- Create `.gitignore` (node_modules, dist, .env)
- Implement `src/db/client.ts`: Postgres connection factory using `postgres` lib, `disconnect()` helper
- Implement `src/db/migrate.ts`: migration runner that reads `.sql` files from `migrations/`, creates `schema_migrations` tracking table, applies unapplied migrations in a transaction
- Create `src/db/migrations/001_create_tables.sql`: `tweets` table, `tweet_media` table with FK, indexes on `author_id`, `created_at`, `tweet_id` in media, unique constraint `(tweet_id, media_key)` on `tweet_media`
- Implement `src/logger.ts`: `logProgress`, `logRateLimit`, `logError`, `logComplete` functions
- Write `tests/migrate.test.ts`: unit test the migration runner logic (mock SQL execution, verify ordering and idempotency)
- Verify: `npx tsc --noEmit` and `npx vitest run` pass

### [x] Step: X API Client
<!-- chat-id: 72f0107d-c593-4564-993e-9388882dff32 -->

Implement the X API v2 HTTP client with rate-limit handling and error management.

- Create `src/api/types.ts`: TypeScript interfaces for `TweetData`, `MediaData`, `SearchResponse`, `Includes`, `SearchParams`, `PublicMetrics`, `ReferencedTweet`
- Implement `src/api/x-client.ts`:
  - `XClient` class initialized with bearer token
  - `getUserIdByUsername(username)` → `GET /2/users/by/username/:username`
  - `searchTweets(params)` → `GET /2/tweets/search/all` with all required fields, expansions, pagination via `next_token`, `max_results=500`
  - Rate-limit handling: detect 429, read `x-rate-limit-reset` header, sleep until reset + 1s buffer, retry
  - Throw unrecoverable error on 401/403 with clear message
- Write `tests/x-client.test.ts`: unit tests with mocked `fetch` covering normal response, pagination, 429 rate-limit retry, 401/403 error
- Verify: `npx tsc --noEmit` and `npx vitest run` pass

### [x] Step: Data Transformation & Ingestion Pipeline
<!-- chat-id: a2d4db1d-e081-49d2-86d1-654d7455a2ad -->

Implement the transform layer and the main paginated ingest loop.

- Implement `src/ingestion/transform.ts`:
  - `transformTweet(tweet, mediaMap)` → maps API response to `tweets` DB row shape (handle nullable `referenced_tweets`, extract first reference only, map `public_metrics` to individual columns, set `ingested_at`)
  - `transformMedia(tweet, mediaMap)` → returns array of `tweet_media` rows for a tweet's attachments
- Implement `src/ingestion/pipeline.ts`:
  - `runPipeline(config, xClient, sql)`: resolve username to user ID if needed, build `from:<user>` query, loop over pages calling `searchTweets`, build media map from `includes.media`, transform tweets and media, batch upsert tweets (`INSERT ... ON CONFLICT (tweet_id) DO UPDATE`), batch upsert media (`INSERT ... ON CONFLICT (tweet_id, media_key) DO UPDATE`), log progress, continue until no `next_token`
- Write `tests/transform.test.ts`: unit tests for tweet transformation (full fields, nullable referenced_tweets, media extraction, edge cases)
- Write `tests/pipeline.test.ts`: unit tests for pipeline logic with mocked XClient and SQL (verify pagination loop, upsert calls, progress logging, error handling for individual tweet failures)
- Verify: `npx tsc --noEmit` and `npx vitest run` pass

### [x] Step: CLI & Main Entry Point
<!-- chat-id: 8076399e-4ea8-4b41-a1b4-7ec1ab7b451b -->

Wire everything together with CLI argument parsing and the main entry point.

- Implement `src/cli.ts`: use `commander` to define `--username`, `--user-id`, `--start-date`, `--end-date`, `--database-url`; validate at least one of username/user-id is provided; validate ISO 8601 date format; return typed config object
- Implement `src/config.ts`: merge CLI args with env vars (`X_BEARER_TOKEN`, `DATABASE_URL`); validate all required values present; export `Config` type
- Implement `src/main.ts`: parse CLI → resolve config → connect DB → run migrations → create XClient → run pipeline → disconnect DB → exit; wrap in try/catch for clean error reporting
- Add `bin` entry or npm script in `package.json` for running: `"start": "tsx src/main.ts"`
- Write `tests/cli.test.ts`: unit tests for CLI parsing (valid args, missing required args, date validation, username vs user-id mutual requirement)
- Verify: `npx tsc --noEmit` and `npx vitest run` pass
