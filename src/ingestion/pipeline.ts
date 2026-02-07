import type postgres from "postgres";
import type { XClient } from "../api/x-client.js";
import { CreditsDepletedError } from "../api/x-client.js";
import type { MediaData } from "../api/types.js";
import { transformTweet, transformMedia } from "./transform.js";
import type { TweetRow, TweetMediaRow } from "./transform.js";
import { logProgress, logError, logComplete } from "../logger.js";

export interface PipelineConfig {
  username?: string;
  userId?: string;
  startDate: string;
  endDate: string;
}

function buildMediaMap(media: MediaData[] | undefined): Map<string, MediaData> {
  const map = new Map<string, MediaData>();
  if (!media) return map;
  for (const m of media) {
    map.set(m.media_key, m);
  }
  return map;
}

async function upsertTweets(sql: postgres.Sql, rows: TweetRow[]) {
  if (rows.length === 0) return;

  await sql`
    INSERT INTO tweets ${sql(
      rows,
      "tweet_id",
      "author_id",
      "text",
      "created_at",
      "conversation_id",
      "lang",
      "retweet_count",
      "reply_count",
      "like_count",
      "quote_count",
      "bookmark_count",
      "impression_count",
      "referenced_tweet_id",
      "referenced_tweet_type",
      "ingested_at",
    )}
    ON CONFLICT (tweet_id) DO UPDATE SET
      text = EXCLUDED.text,
      retweet_count = EXCLUDED.retweet_count,
      reply_count = EXCLUDED.reply_count,
      like_count = EXCLUDED.like_count,
      quote_count = EXCLUDED.quote_count,
      bookmark_count = EXCLUDED.bookmark_count,
      impression_count = EXCLUDED.impression_count,
      referenced_tweet_id = EXCLUDED.referenced_tweet_id,
      referenced_tweet_type = EXCLUDED.referenced_tweet_type,
      ingested_at = EXCLUDED.ingested_at
  `;
}

async function upsertMedia(sql: postgres.Sql, rows: TweetMediaRow[]) {
  if (rows.length === 0) return;

  await sql`
    INSERT INTO tweet_media ${sql(
      rows,
      "tweet_id",
      "media_key",
      "type",
      "url",
      "preview_image_url",
    )}
    ON CONFLICT (tweet_id, media_key) DO UPDATE SET
      type = EXCLUDED.type,
      url = EXCLUDED.url,
      preview_image_url = EXCLUDED.preview_image_url
  `;
}

export async function getLatestTweetDate(
  sql: postgres.Sql,
  authorId: string,
): Promise<string | null> {
  const rows = await sql`
    SELECT created_at FROM tweets
    WHERE author_id = ${authorId}
    ORDER BY created_at DESC
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  return (rows[0].created_at as Date).toISOString();
}

export async function runPipeline(
  config: PipelineConfig,
  xClient: XClient,
  sql: postgres.Sql,
): Promise<number> {
  let userId = config.userId;
  if (!userId && config.username) {
    userId = await xClient.getUserIdByUsername(config.username);
  }
  if (!userId) {
    throw new Error("Either username or userId must be provided");
  }

  const latestDate = await getLatestTweetDate(sql, userId);
  let startTime = config.startDate;
  if (latestDate && latestDate > startTime) {
    startTime = latestDate;
    console.log(`Resuming from ${startTime} (latest tweet already in DB)`);
  }

  const query = `from:${userId}`;
  let nextToken: string | undefined;
  let totalProcessed = 0;

  try {
    do {
      const response = await xClient.searchTweets({
        query,
        start_time: startTime,
        end_time: config.endDate,
        next_token: nextToken,
      });

      const tweets = response.data ?? [];
      if (tweets.length === 0) {
        nextToken = response.meta.next_token;
        if (!nextToken) break;
        continue;
      }

      const mediaMap = buildMediaMap(response.includes?.media);

      const tweetRows: TweetRow[] = [];
      const mediaRows: TweetMediaRow[] = [];

      for (const tweet of tweets) {
        try {
          tweetRows.push(transformTweet(tweet, mediaMap));
          mediaRows.push(...transformMedia(tweet, mediaMap));
        } catch (err) {
          logError(
            `Failed to transform tweet ${tweet.id}: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }

      await upsertTweets(sql, tweetRows);
      await upsertMedia(sql, mediaRows);

      totalProcessed += tweetRows.length;
      logProgress(tweetRows.length, totalProcessed);

      nextToken = response.meta.next_token;
    } while (nextToken);
  } catch (err) {
    if (err instanceof CreditsDepletedError) {
      logError(
        `Credits depleted after processing ${totalProcessed} tweets. Re-run to resume from where you left off.`,
      );
      return totalProcessed;
    }
    throw err;
  }

  logComplete(totalProcessed);
  return totalProcessed;
}
