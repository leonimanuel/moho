/**
 * Media attachment for a tweet
 */
export interface TweetMedia {
  type: string;
  url: string | null;
  preview_image_url: string | null;
}

/**
 * Tweet with associated media attachments
 */
export interface TweetWithMedia {
  tweet_id: string;
  author_id: string;
  text: string;
  created_at: Date;
  retweet_count: number;
  reply_count: number;
  like_count: number;
  quote_count: number;
  impression_count: number;
  media: TweetMedia[];
}

/**
 * Sort field options for tweets query
 */
export type TweetSortField = "created_at" | "like_count" | "retweet_count";

/**
 * Sort order options
 */
export type SortOrder = "asc" | "desc";

/**
 * Parameters for querying tweets
 */
export interface TweetsQueryParams {
  search?: string;
  author?: string;
  sortBy: TweetSortField;
  sortOrder: SortOrder;
  page: number;
  pageSize: number;
}

/**
 * Result of a tweets query including pagination info
 */
export interface TweetsQueryResult {
  tweets: TweetWithMedia[];
  total: number;
}
