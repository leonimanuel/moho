import type { TweetData, MediaData } from "../api/types.js";

export interface TweetRow {
  tweet_id: string;
  author_id: string;
  text: string;
  created_at: string;
  conversation_id: string | null;
  lang: string | null;
  retweet_count: number;
  reply_count: number;
  like_count: number;
  quote_count: number;
  bookmark_count: number;
  impression_count: number;
  referenced_tweet_id: string | null;
  referenced_tweet_type: string | null;
  ingested_at: string;
}

export interface TweetMediaRow {
  tweet_id: string;
  media_key: string;
  type: string;
  url: string | null;
  preview_image_url: string | null;
}

export function transformTweet(
  tweet: TweetData,
  _mediaMap: Map<string, MediaData>,
): TweetRow {
  const ref = tweet.referenced_tweets?.[0] ?? null;

  return {
    tweet_id: tweet.id,
    author_id: tweet.author_id,
    text: tweet.text,
    created_at: tweet.created_at,
    conversation_id: tweet.conversation_id ?? null,
    lang: tweet.lang ?? null,
    retweet_count: tweet.public_metrics.retweet_count,
    reply_count: tweet.public_metrics.reply_count,
    like_count: tweet.public_metrics.like_count,
    quote_count: tweet.public_metrics.quote_count,
    bookmark_count: tweet.public_metrics.bookmark_count ?? 0,
    impression_count: tweet.public_metrics.impression_count ?? 0,
    referenced_tweet_id: ref?.id ?? null,
    referenced_tweet_type: ref?.type ?? null,
    ingested_at: new Date().toISOString(),
  };
}

export function transformMedia(
  tweet: TweetData,
  mediaMap: Map<string, MediaData>,
): TweetMediaRow[] {
  const keys = tweet.attachments?.media_keys;
  if (!keys || keys.length === 0) return [];

  const rows: TweetMediaRow[] = [];
  for (const key of keys) {
    const media = mediaMap.get(key);
    if (!media) continue;
    rows.push({
      tweet_id: tweet.id,
      media_key: media.media_key,
      type: media.type,
      url: media.url ?? null,
      preview_image_url: media.preview_image_url ?? null,
    });
  }
  return rows;
}
