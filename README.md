# X Pipeline

A service that retrieves posts from an X (Twitter) account for a given date range and stores them in a Postgres database.

## Prerequisites

- **Node.js** >= 18
- **Docker** (for the local Postgres instance)
- **X API v2 bearer token** with full-archive search access (Academic Research or Pro tier)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Start Postgres

A `docker-compose.yml` is included for local development:

```bash
docker compose up -d
```

This starts a Postgres 16 instance on port `5432` with:

| Setting  | Value        |
|----------|--------------|
| User     | `postgres`   |
| Password | `postgres`   |
| Database | `x_pipeline` |

### 3. Set environment variables

```bash
export DATABASE_URL="postgres://postgres:postgres@localhost:5432/x_pipeline"
export X_BEARER_TOKEN="<your-x-api-bearer-token>"
```

`DATABASE_URL` can alternatively be passed as a CLI flag (`--database-url`).

## Usage

```bash
npm start -- --username <handle> --start-date <date> --end-date <date>
```

### CLI options

| Flag                   | Required                     | Description                                  |
|------------------------|------------------------------|----------------------------------------------|
| `--username <name>`    | one of `--username`/`--user-id` | X handle to fetch posts for               |
| `--user-id <id>`       | one of `--username`/`--user-id` | X numeric user ID                         |
| `--start-date <date>`  | yes                          | Start date in ISO 8601 format (e.g. `2025-01-01`) |
| `--end-date <date>`    | yes                          | End date in ISO 8601 format (e.g. `2025-02-01`)   |
| `--database-url <url>` | no                           | Overrides `DATABASE_URL` env var           |

### Examples

Fetch all posts from `@elonmusk` in January 2025:

```bash
npm start -- --username elonmusk --start-date 2025-01-01 --end-date 2025-02-01
```

Fetch by user ID instead:

```bash
npm start -- --user-id 44196397 --start-date 2025-01-01 --end-date 2025-02-01
```

## Resume support

The pipeline supports automatic resumption. If a run is interrupted — whether due to API credit exhaustion, a network error, or a manual stop — simply re-run the same command. The pipeline queries the database for the most recent tweet already ingested for the given user and advances the start time accordingly, skipping already-fetched data.

Tweets are upserted page-by-page, so all data fetched before an interruption is safely persisted.

If your X API credits are depleted mid-run (HTTP 402), the pipeline logs how many tweets were saved and exits cleanly. On re-run it picks up where it left off.

## Database schema

Migrations run automatically on startup. Two tables are created:

- **`tweets`** — stores tweet content, metrics (likes, retweets, etc.), and referenced tweet info.
- **`tweet_media`** — stores media attachments (images, videos) linked to tweets.

## Development

```bash
npm run typecheck   # type-check without emitting
npm test            # run tests
```

## Teardown

Stop and remove the local Postgres container and its data:

```bash
docker compose down -v
```
