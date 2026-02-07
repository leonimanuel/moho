import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { TweetData, MediaData } from "../src/api/types.js";
import { transformTweet, transformMedia } from "../src/ingestion/transform.js";

function makeTweet(overrides: Partial<TweetData> = {}): TweetData {
  return {
    id: "100",
    text: "Hello world",
    created_at: "2024-03-01T12:00:00Z",
    author_id: "12345",
    public_metrics: {
      retweet_count: 10,
      reply_count: 5,
      like_count: 20,
      quote_count: 2,
      bookmark_count: 3,
      impression_count: 1000,
    },
    ...overrides,
  };
}

describe("transformTweet", () => {
  let dateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    dateSpy = vi.spyOn(Date.prototype, "toISOString").mockReturnValue("2024-06-01T00:00:00.000Z");
  });

  afterEach(() => {
    dateSpy.mockRestore();
  });

  it("maps all fields from a full tweet", () => {
    const tweet = makeTweet({
      conversation_id: "conv-1",
      lang: "en",
      referenced_tweets: [{ type: "quoted", id: "999" }],
    });
    const row = transformTweet(tweet, new Map());

    expect(row).toEqual({
      tweet_id: "100",
      author_id: "12345",
      text: "Hello world",
      created_at: "2024-03-01T12:00:00Z",
      conversation_id: "conv-1",
      lang: "en",
      retweet_count: 10,
      reply_count: 5,
      like_count: 20,
      quote_count: 2,
      bookmark_count: 3,
      impression_count: 1000,
      referenced_tweet_id: "999",
      referenced_tweet_type: "quoted",
      ingested_at: "2024-06-01T00:00:00.000Z",
    });
  });

  it("handles nullable conversation_id and lang", () => {
    const tweet = makeTweet();
    const row = transformTweet(tweet, new Map());

    expect(row.conversation_id).toBeNull();
    expect(row.lang).toBeNull();
  });

  it("handles missing referenced_tweets", () => {
    const tweet = makeTweet({ referenced_tweets: undefined });
    const row = transformTweet(tweet, new Map());

    expect(row.referenced_tweet_id).toBeNull();
    expect(row.referenced_tweet_type).toBeNull();
  });

  it("handles empty referenced_tweets array", () => {
    const tweet = makeTweet({ referenced_tweets: [] });
    const row = transformTweet(tweet, new Map());

    expect(row.referenced_tweet_id).toBeNull();
    expect(row.referenced_tweet_type).toBeNull();
  });

  it("extracts only the first referenced tweet", () => {
    const tweet = makeTweet({
      referenced_tweets: [
        { type: "retweeted", id: "aaa" },
        { type: "replied_to", id: "bbb" },
      ],
    });
    const row = transformTweet(tweet, new Map());

    expect(row.referenced_tweet_id).toBe("aaa");
    expect(row.referenced_tweet_type).toBe("retweeted");
  });

  it("defaults optional public_metrics to 0", () => {
    const tweet = makeTweet({
      public_metrics: {
        retweet_count: 1,
        reply_count: 2,
        like_count: 3,
        quote_count: 4,
      },
    });
    const row = transformTweet(tweet, new Map());

    expect(row.bookmark_count).toBe(0);
    expect(row.impression_count).toBe(0);
  });
});

describe("transformMedia", () => {
  it("returns media rows for a tweet with attachments", () => {
    const tweet = makeTweet({
      attachments: { media_keys: ["mk1", "mk2"] },
    });
    const mediaMap = new Map<string, MediaData>([
      ["mk1", { media_key: "mk1", type: "photo", url: "https://example.com/1.jpg" }],
      ["mk2", { media_key: "mk2", type: "video", preview_image_url: "https://example.com/2.jpg" }],
    ]);

    const rows = transformMedia(tweet, mediaMap);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({
      tweet_id: "100",
      media_key: "mk1",
      type: "photo",
      url: "https://example.com/1.jpg",
      preview_image_url: null,
    });
    expect(rows[1]).toEqual({
      tweet_id: "100",
      media_key: "mk2",
      type: "video",
      url: null,
      preview_image_url: "https://example.com/2.jpg",
    });
  });

  it("returns empty array when no attachments", () => {
    const tweet = makeTweet();
    const rows = transformMedia(tweet, new Map());
    expect(rows).toEqual([]);
  });

  it("returns empty array when media_keys is empty", () => {
    const tweet = makeTweet({ attachments: { media_keys: [] } });
    const rows = transformMedia(tweet, new Map());
    expect(rows).toEqual([]);
  });

  it("skips media keys not found in the map", () => {
    const tweet = makeTweet({
      attachments: { media_keys: ["mk1", "mk_missing"] },
    });
    const mediaMap = new Map<string, MediaData>([
      ["mk1", { media_key: "mk1", type: "photo", url: "https://example.com/1.jpg" }],
    ]);

    const rows = transformMedia(tweet, mediaMap);

    expect(rows).toHaveLength(1);
    expect(rows[0].media_key).toBe("mk1");
  });
});
