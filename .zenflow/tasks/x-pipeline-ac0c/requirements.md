# X Pipeline - Product Requirements Document

## Overview

A TypeScript CLI tool that retrieves all posts from a given X (Twitter) account for a specified date range using the official X API v2, then ingests and stores them in a PostgreSQL database.

## Primary Use Case

One-shot bulk ingestion of historical tweets from the U.S. State Department's official account (@StateDept) spanning approximately four years. This is expected to be a large volume of tweets requiring robust pagination and rate-limit handling.

## Functional Requirements

### FR-1: CLI Interface

- The tool is invoked from the command line.
- Required arguments:
  - `--username` or `--user-id`: The X account to fetch posts from.
  - `--start-date`: Start of the date range (inclusive), ISO 8601 format (e.g., `2021-01-01`).
  - `--end-date`: End of the date range (inclusive), ISO 8601 format (e.g., `2025-01-01`).
- Optional arguments:
  - `--database-url`: Postgres connection string (overrides env var).
- The CLI should display progress information (tweets fetched, pages processed, rate-limit pauses).

### FR-2: X API v2 Integration

- Use the official X API v2 to retrieve tweets.
- Authenticate using a Bearer Token provided via the `X_BEARER_TOKEN` environment variable.
- Use the **Full-Archive Search** endpoint (`GET /2/tweets/search/all`) which requires Academic Research or Pro-tier access.
- Handle pagination via `next_token` to retrieve all results across the date range.
- Respect API rate limits:
  - Detect `429 Too Many Requests` responses.
  - Read `x-rate-limit-reset` header and sleep until the reset time.
  - Log rate-limit pauses to the console.
- Request the following tweet fields per request:
  - `tweet.fields`: `id`, `text`, `created_at`, `author_id`, `public_metrics`, `attachments`, `referenced_tweets`, `conversation_id`, `lang`
  - `expansions`: `attachments.media_keys`
  - `media.fields`: `url`, `preview_image_url`, `type`

### FR-3: Data Storage

- Store each tweet as a row in a `tweets` table.
- Store media attachment links in a separate `tweet_media` table (one-to-many).
- Use upsert semantics (ON CONFLICT on tweet ID) so the tool can be re-run safely without creating duplicates.

### FR-4: Database Schema Management

- The service manages its own Postgres schema and migrations.
- Migrations run automatically on startup before ingestion begins.
- The Postgres connection string is provided via the `DATABASE_URL` environment variable (or `--database-url` CLI flag).

### FR-5: Resilience

- If the process is interrupted mid-run, re-running with the same parameters should resume cleanly (upsert semantics).
- Log errors for individual tweet processing failures without aborting the entire run.
- On unrecoverable API errors (e.g., 401 Unauthorized, 403 Forbidden), exit with a clear error message.

## Data Model

### `tweets` Table

| Column              | Type         | Description                                  |
|---------------------|--------------|----------------------------------------------|
| `tweet_id`          | `TEXT` (PK)  | X tweet ID (string to avoid bigint issues)   |
| `author_id`         | `TEXT`        | X user ID of the author                      |
| `text`              | `TEXT`        | Full tweet text                              |
| `created_at`        | `TIMESTAMPTZ` | When the tweet was posted                   |
| `conversation_id`   | `TEXT`        | Conversation thread ID                       |
| `lang`              | `TEXT`        | Detected language code                       |
| `retweet_count`     | `INTEGER`    | Number of retweets                           |
| `reply_count`       | `INTEGER`    | Number of replies                            |
| `like_count`        | `INTEGER`    | Number of likes                              |
| `quote_count`       | `INTEGER`    | Number of quotes                             |
| `bookmark_count`    | `INTEGER`    | Number of bookmarks                          |
| `impression_count`  | `INTEGER`    | Number of impressions                        |
| `referenced_tweet_id` | `TEXT`     | ID of retweeted/quoted/replied-to tweet (nullable) |
| `referenced_tweet_type` | `TEXT`   | Type: `retweeted`, `quoted`, `replied_to` (nullable) |
| `ingested_at`       | `TIMESTAMPTZ` | When this row was inserted/updated          |

### `tweet_media` Table

| Column              | Type         | Description                                  |
|---------------------|--------------|----------------------------------------------|
| `id`                | `SERIAL` (PK)| Auto-increment primary key                  |
| `tweet_id`          | `TEXT` (FK)  | References `tweets.tweet_id`                 |
| `media_key`         | `TEXT`        | X media key                                  |
| `type`              | `TEXT`        | `photo`, `video`, `animated_gif`             |
| `url`               | `TEXT`        | Direct URL to the media                      |
| `preview_image_url` | `TEXT`        | Preview/thumbnail URL (nullable)             |

## Non-Functional Requirements

- **NFR-1**: The tool must handle large volumes (tens of thousands of tweets) without running out of memory. Tweets should be written to the database in batches as pages are fetched, not accumulated in memory.
- **NFR-2**: Progress output should be human-readable (e.g., "Fetched 1,500 tweets so far... pausing for rate limit until 10:32:15").
- **NFR-3**: The tool should complete a full 4-year ingestion in a single run, handling all necessary rate-limit pauses automatically.

## Environment Variables

| Variable          | Required | Description                          |
|-------------------|----------|--------------------------------------|
| `X_BEARER_TOKEN`  | Yes      | X API v2 Bearer Token                |
| `DATABASE_URL`    | Yes      | PostgreSQL connection string         |

## Assumptions

- The user has X API v2 access at the Pro or Academic Research tier (required for full-archive search).
- A PostgreSQL instance is already running and accessible; the tool only manages schema, not the database server.
- The `@StateDept` account is public; no user-context auth (OAuth 1.0a) is needed.
- Only the first referenced tweet is stored per tweet (simplification for retweets/quotes/replies). If a tweet references multiple tweets, only the first is captured.
