CREATE TABLE IF NOT EXISTS tweets (
  tweet_id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  conversation_id TEXT,
  lang TEXT,
  retweet_count INTEGER NOT NULL DEFAULT 0,
  reply_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  quote_count INTEGER NOT NULL DEFAULT 0,
  bookmark_count INTEGER NOT NULL DEFAULT 0,
  impression_count INTEGER NOT NULL DEFAULT 0,
  referenced_tweet_id TEXT,
  referenced_tweet_type TEXT,
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tweets_author_id ON tweets (author_id);
CREATE INDEX IF NOT EXISTS idx_tweets_created_at ON tweets (created_at);

CREATE TABLE IF NOT EXISTS tweet_media (
  id SERIAL PRIMARY KEY,
  tweet_id TEXT NOT NULL REFERENCES tweets (tweet_id),
  media_key TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT,
  preview_image_url TEXT,
  UNIQUE (tweet_id, media_key)
);

CREATE INDEX IF NOT EXISTS idx_tweet_media_tweet_id ON tweet_media (tweet_id);
