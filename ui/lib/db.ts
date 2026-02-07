import postgres, { Sql } from "postgres";
import type {
  TweetsQueryParams,
  TweetsQueryResult,
  TweetWithMedia,
  TweetMedia,
} from "./types";

// Lazy initialization of postgres client to support build-time without DATABASE_URL
let sqlClient: Sql | null = null;

function getSql(): Sql {
  if (sqlClient) {
    return sqlClient;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
        "Please set it in .env.local or your deployment environment."
    );
  }

  // Create a postgres client with connection pooling suitable for serverless
  // Neon requires SSL mode, which is specified in the connection string
  sqlClient = postgres(connectionString, {
    // Connection pool settings for serverless environment
    max: 10, // Maximum connections in pool
    idle_timeout: 20, // Close idle connections after 20 seconds
    connect_timeout: 10, // Timeout for establishing new connections
  });

  return sqlClient;
}

// Raw row type from database query
interface TweetRow {
  tweet_id: string;
  author_id: string;
  text: string;
  created_at: Date;
  retweet_count: number;
  reply_count: number;
  like_count: number;
  quote_count: number;
  impression_count: number;
  media_type: string | null;
  media_url: string | null;
  media_preview_image_url: string | null;
}

/**
 * Get paginated tweets with optional filtering and sorting.
 * Joins with tweet_media to include media attachments.
 */
export async function getTweets(
  params: TweetsQueryParams
): Promise<TweetsQueryResult> {
  const { search, author, sortBy, sortOrder, page, pageSize } = params;
  const offset = (page - 1) * pageSize;

  // Build WHERE conditions
  const conditions: string[] = [];
  const values: (string | number)[] = [];
  let paramIndex = 1;

  if (search) {
    conditions.push(`t.text ILIKE $${paramIndex}`);
    values.push(`%${search}%`);
    paramIndex++;
  }

  if (author) {
    conditions.push(`t.author_id = $${paramIndex}`);
    values.push(author);
    paramIndex++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Validate sortBy to prevent SQL injection
  const validSortFields = ["created_at", "like_count", "retweet_count"];
  const safeSortBy = validSortFields.includes(sortBy) ? sortBy : "created_at";
  const safeSortOrder = sortOrder === "asc" ? "ASC" : "DESC";

  const sql = getSql();

  // Get total count
  const countQuery = `SELECT COUNT(DISTINCT t.tweet_id) as count FROM tweets t ${whereClause}`;
  const countResult = await sql.unsafe(countQuery, values);
  const total = parseInt(countResult[0].count as string, 10);

  // Get tweets with media using LEFT JOIN and aggregation
  // We first get the tweet IDs for the current page, then fetch full data
  const tweetsQuery = `
    WITH paginated_tweets AS (
      SELECT DISTINCT t.tweet_id, t.${safeSortBy}
      FROM tweets t
      ${whereClause}
      ORDER BY t.${safeSortBy} ${safeSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    )
    SELECT
      t.tweet_id,
      t.author_id,
      t.text,
      t.created_at,
      t.retweet_count,
      t.reply_count,
      t.like_count,
      t.quote_count,
      t.impression_count,
      m.type as media_type,
      m.url as media_url,
      m.preview_image_url as media_preview_image_url
    FROM tweets t
    INNER JOIN paginated_tweets pt ON t.tweet_id = pt.tweet_id
    LEFT JOIN tweet_media m ON t.tweet_id = m.tweet_id
    ORDER BY t.${safeSortBy} ${safeSortOrder}, t.tweet_id, m.id
  `;

  const tweetsValues = [...values, pageSize, offset];
  const rows = (await sql.unsafe(tweetsQuery, tweetsValues)) as TweetRow[];

  // Group rows by tweet_id to aggregate media
  const tweetsMap = new Map<string, TweetWithMedia>();

  for (const row of rows) {
    if (!tweetsMap.has(row.tweet_id)) {
      tweetsMap.set(row.tweet_id, {
        tweet_id: row.tweet_id,
        author_id: row.author_id,
        text: row.text,
        created_at: row.created_at,
        retweet_count: row.retweet_count,
        reply_count: row.reply_count,
        like_count: row.like_count,
        quote_count: row.quote_count,
        impression_count: row.impression_count,
        media: [],
      });
    }

    // Add media if present
    if (row.media_type) {
      const tweet = tweetsMap.get(row.tweet_id)!;
      const media: TweetMedia = {
        type: row.media_type,
        url: row.media_url,
        preview_image_url: row.media_preview_image_url,
      };
      tweet.media.push(media);
    }
  }

  // Convert map to array and maintain sort order
  const tweets = Array.from(tweetsMap.values());

  return { tweets, total };
}

/**
 * Get distinct author IDs from all tweets.
 * Used to populate the author filter dropdown.
 */
export async function getAuthors(): Promise<string[]> {
  const sql = getSql();
  const result = await sql`
    SELECT DISTINCT author_id
    FROM tweets
    ORDER BY author_id
  `;

  return result.map((row) => row.author_id as string);
}
