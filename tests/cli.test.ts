import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { parseCli } from "../src/cli.js";
import { resolveConfig } from "../src/config.js";

const BASE_ARGV = ["node", "x-pipeline"];

describe("parseCli", () => {
  beforeEach(() => {
    vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit");
    });
    vi.spyOn(process.stderr, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("parses valid args with --username", () => {
    const args = parseCli([
      ...BASE_ARGV,
      "--username",
      "testuser",
      "--start-date",
      "2024-01-01",
      "--end-date",
      "2024-06-01",
    ]);

    expect(args).toEqual({
      username: "testuser",
      userId: undefined,
      startDate: "2024-01-01",
      endDate: "2024-06-01",
      databaseUrl: undefined,
    });
  });

  it("parses valid args with --user-id", () => {
    const args = parseCli([
      ...BASE_ARGV,
      "--user-id",
      "12345",
      "--start-date",
      "2024-01-01T00:00:00Z",
      "--end-date",
      "2024-06-01T00:00:00Z",
    ]);

    expect(args).toEqual({
      username: undefined,
      userId: "12345",
      startDate: "2024-01-01T00:00:00Z",
      endDate: "2024-06-01T00:00:00Z",
      databaseUrl: undefined,
    });
  });

  it("parses --database-url when provided", () => {
    const args = parseCli([
      ...BASE_ARGV,
      "--username",
      "testuser",
      "--start-date",
      "2024-01-01",
      "--end-date",
      "2024-06-01",
      "--database-url",
      "postgres://localhost/test",
    ]);

    expect(args.databaseUrl).toBe("postgres://localhost/test");
  });

  it("errors when neither --username nor --user-id is provided", () => {
    expect(() =>
      parseCli([...BASE_ARGV, "--start-date", "2024-01-01", "--end-date", "2024-06-01"])
    ).toThrow();
  });

  it("errors when --start-date is missing", () => {
    expect(() =>
      parseCli([...BASE_ARGV, "--username", "testuser", "--end-date", "2024-06-01"])
    ).toThrow();
  });

  it("errors when --end-date is missing", () => {
    expect(() =>
      parseCli([...BASE_ARGV, "--username", "testuser", "--start-date", "2024-01-01"])
    ).toThrow();
  });

  it("errors on invalid start date format", () => {
    expect(() =>
      parseCli([
        ...BASE_ARGV,
        "--username",
        "testuser",
        "--start-date",
        "not-a-date",
        "--end-date",
        "2024-06-01",
      ])
    ).toThrow("ISO 8601");
  });

  it("errors on invalid end date format", () => {
    expect(() =>
      parseCli([
        ...BASE_ARGV,
        "--username",
        "testuser",
        "--start-date",
        "2024-01-01",
        "--end-date",
        "13/01/2024",
      ])
    ).toThrow("ISO 8601");
  });

  it("accepts full ISO 8601 datetime with timezone offset", () => {
    const args = parseCli([
      ...BASE_ARGV,
      "--username",
      "testuser",
      "--start-date",
      "2024-01-01T00:00:00+05:30",
      "--end-date",
      "2024-06-01T23:59:59Z",
    ]);

    expect(args.startDate).toBe("2024-01-01T00:00:00+05:30");
    expect(args.endDate).toBe("2024-06-01T23:59:59Z");
  });
});

describe("resolveConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("resolves config from CLI args and env vars", () => {
    process.env.X_BEARER_TOKEN = "test-bearer-token";
    process.env.DATABASE_URL = "postgres://localhost/testdb";
    delete process.env.X_API_KEY;
    delete process.env.X_API_SECRET;

    const config = resolveConfig({
      username: "testuser",
      startDate: "2024-01-01",
      endDate: "2024-06-01",
    });

    expect(config).toEqual({
      username: "testuser",
      userId: undefined,
      startDate: "2024-01-01",
      endDate: "2024-06-01",
      databaseUrl: "postgres://localhost/testdb",
      bearerToken: "test-bearer-token",
      apiKey: undefined,
      apiSecret: undefined,
    });
  });

  it("CLI --database-url overrides DATABASE_URL env var", () => {
    process.env.X_BEARER_TOKEN = "token";
    process.env.DATABASE_URL = "postgres://env/db";

    const config = resolveConfig({
      username: "testuser",
      startDate: "2024-01-01",
      endDate: "2024-06-01",
      databaseUrl: "postgres://cli/db",
    });

    expect(config.databaseUrl).toBe("postgres://cli/db");
  });

  it("throws when DATABASE_URL is missing from both CLI and env", () => {
    process.env.X_BEARER_TOKEN = "token";
    delete process.env.DATABASE_URL;

    expect(() =>
      resolveConfig({
        username: "testuser",
        startDate: "2024-01-01",
        endDate: "2024-06-01",
      })
    ).toThrow("Database URL is required");
  });

  it("throws when X_BEARER_TOKEN is missing", () => {
    delete process.env.X_BEARER_TOKEN;
    process.env.DATABASE_URL = "postgres://localhost/db";

    expect(() =>
      resolveConfig({
        username: "testuser",
        startDate: "2024-01-01",
        endDate: "2024-06-01",
      })
    ).toThrow("X_BEARER_TOKEN");
  });
});
