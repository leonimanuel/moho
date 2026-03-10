# Investigation: Service returned 500

## Bug Summary

The Next.js UI service returns HTTP 500 when users visit the tweets page. The error originates from a failed PostgreSQL query in `ui/lib/db.ts`.

## Root Cause Analysis

**Primary root cause**: Invalid SQL in the `getTweets` function's pagination CTE (Common Table Expression).

In `ui/lib/db.ts`, the `getTweets` function constructs a CTE using `SELECT DISTINCT` with an `ORDER BY` on a column not in the select list:

```sql
-- BEFORE fix (broken)
WITH paginated_tweets AS (
  SELECT DISTINCT t.tweet_id          -- only tweet_id selected
  FROM tweets t
  ORDER BY t.created_at DESC          -- but ordering by created_at
  LIMIT $1 OFFSET $2
)
```

PostgreSQL rejects this with:
```
ERROR: for SELECT DISTINCT, ORDER BY expressions must appear in select list
```

This error is thrown by the `postgres` library during `sql.unsafe()`, propagates unhandled through the server component in `page.tsx`, and Next.js returns HTTP 500.

The error occurs for **all three sort fields** (`created_at`, `like_count`, `retweet_count`), meaning the page is broken on every request regardless of sort selection.

**Fix applied in commit `9e4ee3e`**: Added the sort column to the SELECT list:

```sql
-- AFTER fix (correct)
WITH paginated_tweets AS (
  SELECT DISTINCT t.tweet_id, t.${safeSortBy}   -- sort column included
  FROM tweets t
  ORDER BY t.${safeSortBy} ${safeSortOrder}
  LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
)
```

This fix is correct - since `tweet_id` is a primary key, each `(tweet_id, sort_column)` pair is unique, so `DISTINCT` behaves identically to before but now satisfies PostgreSQL's requirement.

## Affected Components

- **`ui/lib/db.ts`** - `getTweets()` function, line ~99 (the CTE query)
- **`ui/app/page.tsx`** - Server component that calls `getTweets()` without error handling; any thrown error becomes a 500

## Additional Issues Found

1. **No error handling in page.tsx**: The `Promise.all([getTweets(...), getAuthors()])` call has no try/catch. Any database error (connection timeout, missing tables, etc.) results in a 500. While `error.tsx` catches the error for UI display, the server still returns HTTP 500.

2. **No retry logic in XClient for 5xx errors**: The `XClient.request()` method retries on HTTP 429 (rate limit) but throws immediately on 500/5xx. If the X API returns a transient 500, the CLI pipeline crashes without retry.

## Proposed Solution

The SQL fix in commit `9e4ee3e` addresses the primary root cause. To prevent future 500s:

1. **Verify the SQL fix** - The fix is correct and complete for all sort fields
2. **Add regression test** - Write a test for `getTweets` that exercises all sort fields to catch SQL errors
3. **(Optional) Add retry logic for XClient 5xx responses** - Implement exponential backoff for transient server errors
