export interface PublicMetrics {
  retweet_count: number;
  reply_count: number;
  like_count: number;
  quote_count: number;
  bookmark_count?: number;
  impression_count?: number;
}

export interface ReferencedTweet {
  type: "retweeted" | "quoted" | "replied_to";
  id: string;
}

export interface TweetData {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  public_metrics: PublicMetrics;
  attachments?: {
    media_keys?: string[];
  };
  referenced_tweets?: ReferencedTweet[];
  conversation_id?: string;
  lang?: string;
}

export interface MediaData {
  media_key: string;
  type: string;
  url?: string;
  preview_image_url?: string;
}

export interface Includes {
  media?: MediaData[];
}

export interface SearchMeta {
  newest_id?: string;
  oldest_id?: string;
  result_count: number;
  next_token?: string;
}

export interface SearchResponse {
  data?: TweetData[];
  includes?: Includes;
  meta: SearchMeta;
}

export interface UserResponse {
  data: {
    id: string;
    name: string;
    username: string;
  };
}

export interface SearchParams {
  query: string;
  start_time: string;
  end_time: string;
  next_token?: string;
  max_results?: number;
}
