import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { XClient, CreditsDepletedError } from "../src/api/x-client.js";
import type { SearchResponse, UserResponse } from "../src/api/types.js";

const BEARER = "test-bearer-token";

function mockFetchResponse(body: unknown, status = 200, headers?: Record<string, string>) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(headers),
    json: async () => body,
    text: async () => JSON.stringify(body),
  });
}

describe("XClient", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe("getUserIdByUsername", () => {
    it("resolves a username to a user ID", async () => {
      const userResp: UserResponse = {
        data: { id: "12345", name: "Test User", username: "testuser" },
      };
      globalThis.fetch = mockFetchResponse(userResp);

      const client = new XClient(BEARER);
      const id = await client.getUserIdByUsername("testuser");

      expect(id).toBe("12345");
      expect(globalThis.fetch).toHaveBeenCalledOnce();
      const calledUrl = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(calledUrl).toContain("/users/by/username/testuser");
    });

    it("strips leading @ from username", async () => {
      const userResp: UserResponse = {
        data: { id: "12345", name: "Test User", username: "testuser" },
      };
      globalThis.fetch = mockFetchResponse(userResp);

      const client = new XClient(BEARER);
      await client.getUserIdByUsername("@testuser");

      const calledUrl = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(calledUrl).toContain("/users/by/username/testuser");
      expect(calledUrl).not.toContain("@");
    });

    it("sends Authorization header with bearer token", async () => {
      const userResp: UserResponse = {
        data: { id: "12345", name: "Test User", username: "testuser" },
      };
      globalThis.fetch = mockFetchResponse(userResp);

      const client = new XClient(BEARER);
      await client.getUserIdByUsername("testuser");

      const calledOptions = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit;
      expect(calledOptions.headers).toEqual({
        Authorization: `Bearer ${BEARER}`,
      });
    });
  });

  describe("searchTweets", () => {
    const baseParams = {
      query: "from:testuser",
      start_time: "2024-01-01T00:00:00Z",
      end_time: "2024-06-01T00:00:00Z",
    };

    it("returns search results with correct query params", async () => {
      const searchResp: SearchResponse = {
        data: [
          {
            id: "111",
            text: "Hello world",
            created_at: "2024-03-01T12:00:00Z",
            author_id: "12345",
            public_metrics: {
              retweet_count: 1,
              reply_count: 2,
              like_count: 3,
              quote_count: 0,
            },
          },
        ],
        meta: { result_count: 1 },
      };
      globalThis.fetch = mockFetchResponse(searchResp);

      const client = new XClient(BEARER);
      const result = await client.searchTweets(baseParams);

      expect(result.data).toHaveLength(1);
      expect(result.data![0].id).toBe("111");
      expect(result.meta.result_count).toBe(1);

      const calledUrl = new URL(
        (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
      );
      expect(calledUrl.searchParams.get("query")).toBe("from:testuser");
      expect(calledUrl.searchParams.get("start_time")).toBe("2024-01-01T00:00:00Z");
      expect(calledUrl.searchParams.get("end_time")).toBe("2024-06-01T00:00:00Z");
      expect(calledUrl.searchParams.get("max_results")).toBe("500");
      expect(calledUrl.searchParams.get("tweet.fields")).toContain("public_metrics");
      expect(calledUrl.searchParams.get("expansions")).toBe("attachments.media_keys");
      expect(calledUrl.searchParams.get("media.fields")).toContain("url");
    });

    it("includes next_token when provided", async () => {
      const searchResp: SearchResponse = {
        data: [],
        meta: { result_count: 0 },
      };
      globalThis.fetch = mockFetchResponse(searchResp);

      const client = new XClient(BEARER);
      await client.searchTweets({ ...baseParams, next_token: "abc123" });

      const calledUrl = new URL(
        (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
      );
      expect(calledUrl.searchParams.get("next_token")).toBe("abc123");
    });

    it("does not include next_token when not provided", async () => {
      const searchResp: SearchResponse = {
        data: [],
        meta: { result_count: 0 },
      };
      globalThis.fetch = mockFetchResponse(searchResp);

      const client = new XClient(BEARER);
      await client.searchTweets(baseParams);

      const calledUrl = new URL(
        (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
      );
      expect(calledUrl.searchParams.has("next_token")).toBe(false);
    });

    it("handles pagination with next_token in response", async () => {
      const searchResp: SearchResponse = {
        data: [
          {
            id: "111",
            text: "Tweet",
            created_at: "2024-03-01T12:00:00Z",
            author_id: "12345",
            public_metrics: {
              retweet_count: 0,
              reply_count: 0,
              like_count: 0,
              quote_count: 0,
            },
          },
        ],
        meta: { result_count: 1, next_token: "next-page-token" },
      };
      globalThis.fetch = mockFetchResponse(searchResp);

      const client = new XClient(BEARER);
      const result = await client.searchTweets(baseParams);

      expect(result.meta.next_token).toBe("next-page-token");
    });
  });

  describe("rate limit handling", () => {
    it("retries after 429 with x-rate-limit-reset header", async () => {
      const resetEpoch = Math.floor(Date.now() / 1000) + 1;

      const rateLimitResponse = {
        ok: false,
        status: 429,
        headers: new Headers({
          "x-rate-limit-reset": String(resetEpoch),
        }),
        json: async () => ({}),
        text: async () => "rate limited",
      };

      const successResponse: SearchResponse = {
        data: [
          {
            id: "111",
            text: "Tweet",
            created_at: "2024-03-01T12:00:00Z",
            author_id: "12345",
            public_metrics: {
              retweet_count: 0,
              reply_count: 0,
              like_count: 0,
              quote_count: 0,
            },
          },
        ],
        meta: { result_count: 1 },
      };

      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce(rateLimitResponse)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => successResponse,
          text: async () => JSON.stringify(successResponse),
        });

      const client = new XClient(BEARER);
      const result = await client.searchTweets({
        query: "from:testuser",
        start_time: "2024-01-01T00:00:00Z",
        end_time: "2024-06-01T00:00:00Z",
      });

      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
      expect(result.data).toHaveLength(1);
    }, 10000);
  });

  describe("error handling", () => {
    it("throws on 401 Unauthorized", async () => {
      globalThis.fetch = mockFetchResponse({ error: "unauthorized" }, 401);

      const client = new XClient(BEARER);
      await expect(
        client.getUserIdByUsername("testuser")
      ).rejects.toThrow("Authentication failed (401)");
    });

    it("throws on 403 Forbidden", async () => {
      globalThis.fetch = mockFetchResponse({ error: "forbidden" }, 403);

      const client = new XClient(BEARER);
      await expect(
        client.searchTweets({
          query: "from:testuser",
          start_time: "2024-01-01T00:00:00Z",
          end_time: "2024-06-01T00:00:00Z",
        })
      ).rejects.toThrow("Access forbidden (403)");
    });

    it("throws CreditsDepletedError on 402", async () => {
      globalThis.fetch = mockFetchResponse({ title: "CreditsDepleted" }, 402);

      const client = new XClient(BEARER);
      await expect(
        client.searchTweets({
          query: "from:testuser",
          start_time: "2024-01-01T00:00:00Z",
          end_time: "2024-06-01T00:00:00Z",
        })
      ).rejects.toThrow(CreditsDepletedError);
    });

    it("throws on unexpected error status", async () => {
      globalThis.fetch = mockFetchResponse({ error: "server error" }, 500);

      const client = new XClient(BEARER);
      await expect(
        client.getUserIdByUsername("testuser")
      ).rejects.toThrow("X API request failed with status 500");
    });
  });
});
