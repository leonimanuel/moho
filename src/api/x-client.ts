import { logRateLimit } from "../logger.js";
import type {
  SearchParams,
  SearchResponse,
  UserResponse,
} from "./types.js";

export class CreditsDepletedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CreditsDepletedError";
  }
}

const BASE_URL = "https://api.x.com/2";

const TWEET_FIELDS =
  "id,text,created_at,author_id,public_metrics,attachments,referenced_tweets,conversation_id,lang";
const EXPANSIONS = "attachments.media_keys";
const MEDIA_FIELDS = "url,preview_image_url,type";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class XClient {
  private bearerToken: string;

  constructor(bearerToken: string) {
    this.bearerToken = bearerToken;
  }

  private authHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.bearerToken}`,
    };
  }

  private async request<T>(url: string): Promise<T> {
    while (true) {
      const response = await fetch(url, { headers: this.authHeaders() });

      if (response.status === 429) {
        const resetHeader = response.headers.get("x-rate-limit-reset");
        const resetEpoch = resetHeader ? parseInt(resetHeader, 10) : 0;
        const now = Math.floor(Date.now() / 1000);
        const waitSeconds = Math.max(resetEpoch - now + 1, 1);
        logRateLimit(new Date(resetEpoch * 1000));
        await sleep(waitSeconds * 1000);
        continue;
      }

      if (response.status === 402) {
        const body = await response.text();
        throw new CreditsDepletedError(
          `X API credits depleted (402): ${body}`
        );
      }

      if (response.status === 401) {
        throw new Error(
          "Authentication failed (401). Check your X_BEARER_TOKEN."
        );
      }

      if (response.status === 403) {
        throw new Error(
          "Access forbidden (403). Your token may lack the required permissions or the endpoint requires Academic Research access."
        );
      }

      if (!response.ok) {
        const body = await response.text();
        throw new Error(
          `X API request failed with status ${response.status}: ${body}`
        );
      }

      return (await response.json()) as T;
    }
  }

  async getUserIdByUsername(username: string): Promise<string> {
    const cleanUsername = username.replace(/^@/, "");
    const url = `${BASE_URL}/users/by/username/${encodeURIComponent(cleanUsername)}`;
    const response = await this.request<UserResponse>(url);
    return response.data.id;
  }

  async searchTweets(params: SearchParams): Promise<SearchResponse> {
    const url = new URL(`${BASE_URL}/tweets/search/all`);
    url.searchParams.set("query", params.query);
    url.searchParams.set("start_time", params.start_time);
    url.searchParams.set("end_time", params.end_time);
    url.searchParams.set("max_results", String(params.max_results ?? 500));
    url.searchParams.set("tweet.fields", TWEET_FIELDS);
    url.searchParams.set("expansions", EXPANSIONS);
    url.searchParams.set("media.fields", MEDIA_FIELDS);

    if (params.next_token) {
      url.searchParams.set("next_token", params.next_token);
    }

    return this.request<SearchResponse>(url.toString());
  }
}
