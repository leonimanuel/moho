import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SearchResponse } from "../src/api/types.js";
import { runPipeline } from "../src/ingestion/pipeline.js";
import type { PipelineConfig } from "../src/ingestion/pipeline.js";
import { CreditsDepletedError } from "../src/api/x-client.js";

vi.mock("../src/logger.js", () => ({
  logProgress: vi.fn(),
  logError: vi.fn(),
  logComplete: vi.fn(),
  logRateLimit: vi.fn(),
}));

function makeSearchResponse(
  overrides: Partial<SearchResponse> = {},
): SearchResponse {
  return {
    data: [
      {
        id: "111",
        text: "Hello",
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
    ...overrides,
  };
}

function createMockXClient(responses: SearchResponse[]) {
  let callIndex = 0;
  return {
    getUserIdByUsername: vi.fn(async () => "12345"),
    searchTweets: vi.fn(async () => {
      const resp = responses[callIndex] ?? { meta: { result_count: 0 } };
      callIndex++;
      return resp;
    }),
  };
}

function createMockSql(resumeRows: Record<string, unknown>[] = []) {
  let firstCall = true;
  const tagged = vi.fn(async () => {
    if (firstCall) {
      firstCall = false;
      return resumeRows;
    }
    return [];
  }) as any;
  tagged.unsafe = vi.fn(async () => []);
  return tagged;
}

describe("runPipeline", () => {
  const baseConfig: PipelineConfig = {
    username: "testuser",
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2024-06-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("resolves username to userId when only username is provided", async () => {
    const client = createMockXClient([makeSearchResponse()]);
    const sql = createMockSql();

    await runPipeline(baseConfig, client as any, sql);

    expect(client.getUserIdByUsername).toHaveBeenCalledWith("testuser");
  });

  it("skips username resolution when userId is provided", async () => {
    const config: PipelineConfig = {
      userId: "12345",
      startDate: "2024-01-01T00:00:00Z",
      endDate: "2024-06-01T00:00:00Z",
    };
    const client = createMockXClient([makeSearchResponse()]);
    const sql = createMockSql();

    await runPipeline(config, client as any, sql);

    expect(client.getUserIdByUsername).not.toHaveBeenCalled();
  });

  it("throws when neither username nor userId is provided", async () => {
    const config: PipelineConfig = {
      startDate: "2024-01-01T00:00:00Z",
      endDate: "2024-06-01T00:00:00Z",
    };
    const client = createMockXClient([]);
    const sql = createMockSql();

    await expect(runPipeline(config, client as any, sql)).rejects.toThrow(
      "Either username or userId must be provided",
    );
  });

  it("processes a single page of results", async () => {
    const client = createMockXClient([makeSearchResponse()]);
    const sql = createMockSql();

    const total = await runPipeline(baseConfig, client as any, sql);

    expect(total).toBe(1);
    expect(client.searchTweets).toHaveBeenCalledTimes(1);
    expect(sql).toHaveBeenCalled();
  });

  it("paginates through multiple pages", async () => {
    const page1 = makeSearchResponse({
      meta: { result_count: 1, next_token: "page2token" },
    });
    const page2 = makeSearchResponse({
      data: [
        {
          id: "222",
          text: "Second",
          created_at: "2024-03-02T12:00:00Z",
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
    });

    const client = createMockXClient([page1, page2]);
    const sql = createMockSql();

    const total = await runPipeline(baseConfig, client as any, sql);

    expect(total).toBe(2);
    expect(client.searchTweets).toHaveBeenCalledTimes(2);
    const secondCall = client.searchTweets.mock.calls[1] as unknown[];
    const secondCallParams = secondCall[0] as any;
    expect(secondCallParams.next_token).toBe("page2token");
  });

  it("handles empty response with no data", async () => {
    const emptyResponse: SearchResponse = {
      meta: { result_count: 0 },
    };
    const client = createMockXClient([emptyResponse]);
    const sql = createMockSql();

    const total = await runPipeline(baseConfig, client as any, sql);

    expect(total).toBe(0);
  });

  it("builds query with from:<userId>", async () => {
    const config: PipelineConfig = {
      userId: "99999",
      startDate: "2024-01-01T00:00:00Z",
      endDate: "2024-06-01T00:00:00Z",
    };
    const client = createMockXClient([makeSearchResponse()]);
    const sql = createMockSql();

    await runPipeline(config, client as any, sql);

    const firstCall = client.searchTweets.mock.calls[0] as unknown[];
    const params = firstCall[0] as any;
    expect(params.query).toBe("from:99999");
    expect(params.start_time).toBe("2024-01-01T00:00:00Z");
    expect(params.end_time).toBe("2024-06-01T00:00:00Z");
  });

  it("logs progress and completion", async () => {
    const { logProgress, logComplete } = await import("../src/logger.js");
    const client = createMockXClient([makeSearchResponse()]);
    const sql = createMockSql();

    await runPipeline(baseConfig, client as any, sql);

    expect(logProgress).toHaveBeenCalledWith(1, 1);
    expect(logComplete).toHaveBeenCalledWith(1);
  });

  it("continues processing when individual tweet transformation fails", async () => {
    const { logError } = await import("../src/logger.js");
    const response = makeSearchResponse({
      data: [
        {
          id: "111",
          text: "Good tweet",
          created_at: "2024-03-01T12:00:00Z",
          author_id: "12345",
          public_metrics: {
            retweet_count: 1,
            reply_count: 2,
            like_count: 3,
            quote_count: 0,
          },
        },
        {
          id: "222",
          text: "Another tweet",
          created_at: "2024-03-02T12:00:00Z",
          author_id: "12345",
          public_metrics: null as any,
        },
      ],
      meta: { result_count: 2 },
    });

    const client = createMockXClient([response]);
    const sql = createMockSql();

    const total = await runPipeline(baseConfig, client as any, sql);

    expect(total).toBe(1);
    expect(logError).toHaveBeenCalledWith(
      expect.stringContaining("Failed to transform tweet 222"),
    );
  });

  it("resumes from latest tweet date in DB", async () => {
    const client = createMockXClient([makeSearchResponse()]);
    const resumeDate = new Date("2024-04-15T10:00:00Z");
    const sql = createMockSql([{ created_at: resumeDate }]);

    await runPipeline(baseConfig, client as any, sql);

    const searchCall = client.searchTweets.mock.calls[0] as unknown[];
    const params = searchCall[0] as any;
    expect(params.start_time).toBe(resumeDate.toISOString());
  });

  it("uses original start date when DB has no tweets", async () => {
    const client = createMockXClient([makeSearchResponse()]);
    const sql = createMockSql();

    await runPipeline(baseConfig, client as any, sql);

    const searchCall = client.searchTweets.mock.calls[0] as unknown[];
    const params = searchCall[0] as any;
    expect(params.start_time).toBe("2024-01-01T00:00:00Z");
  });

  it("uses original start date when DB latest is before config start", async () => {
    const client = createMockXClient([makeSearchResponse()]);
    const earlyDate = new Date("2023-06-01T00:00:00Z");
    const sql = createMockSql([{ created_at: earlyDate }]);

    await runPipeline(baseConfig, client as any, sql);

    const searchCall = client.searchTweets.mock.calls[0] as unknown[];
    const params = searchCall[0] as any;
    expect(params.start_time).toBe("2024-01-01T00:00:00Z");
  });

  it("handles CreditsDepletedError gracefully and returns processed count", async () => {
    const { logError } = await import("../src/logger.js");
    const page1 = makeSearchResponse({
      meta: { result_count: 1, next_token: "page2token" },
    });
    let callIndex = 0;
    const client = {
      getUserIdByUsername: vi.fn(async () => "12345"),
      searchTweets: vi.fn(async () => {
        if (callIndex++ === 0) return page1;
        throw new CreditsDepletedError("credits gone");
      }),
    };
    const sql = createMockSql();

    const total = await runPipeline(baseConfig, client as any, sql);

    expect(total).toBe(1);
    expect(logError).toHaveBeenCalledWith(
      expect.stringContaining("Credits depleted"),
    );
  });
});
