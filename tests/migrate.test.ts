import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "node:fs";
import { getMigrationFiles } from "../src/db/migrate.js";

vi.mock("node:fs");

describe("getMigrationFiles", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns sorted .sql files from directory", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(
      ["003_add_index.sql", "001_create_tables.sql", "002_add_column.sql", "readme.txt"] as any
    );

    const files = getMigrationFiles("/fake/dir");
    expect(files).toEqual([
      "001_create_tables.sql",
      "002_add_column.sql",
      "003_add_index.sql",
    ]);
  });

  it("filters out non-sql files", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(
      ["001_create_tables.sql", ".DS_Store", "notes.md"] as any
    );

    const files = getMigrationFiles("/fake/dir");
    expect(files).toEqual(["001_create_tables.sql"]);
  });

  it("returns empty array if directory does not exist", () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const files = getMigrationFiles("/nonexistent");
    expect(files).toEqual([]);
  });
});

describe("runMigrations", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("applies pending migrations in order", async () => {
    const unsafeCalls: string[] = [];

    const mockTx = {
      unsafe: vi.fn(async (content: string) => {
        unsafeCalls.push(content);
      }),
    };

    const mockSql = Object.assign(vi.fn(async () => []), {
      begin: vi.fn(async (cb: (tx: any) => Promise<void>) => {
        await cb(mockTx);
      }),
    }) as any;

    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(
      ["001_create_tables.sql", "002_add_column.sql"] as any
    );
    vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
      const name = String(filePath);
      if (name.includes("001")) return "CREATE TABLE test1;";
      if (name.includes("002")) return "ALTER TABLE test1 ADD col;";
      return "";
    });

    const { runMigrations } = await import("../src/db/migrate.js");
    const executed = await runMigrations(mockSql, "/fake/migrations");

    expect(executed).toEqual(["001_create_tables.sql", "002_add_column.sql"]);
    expect(mockTx.unsafe).toHaveBeenCalledTimes(4);
    expect(unsafeCalls[0]).toBe("CREATE TABLE test1;");
    expect(unsafeCalls[1]).toContain("INSERT INTO schema_migrations");
    expect(unsafeCalls[2]).toBe("ALTER TABLE test1 ADD col;");
    expect(unsafeCalls[3]).toContain("INSERT INTO schema_migrations");
  });

  it("skips already applied migrations", async () => {
    const mockTx = {
      unsafe: vi.fn(),
    };

    const appliedRows = [{ name: "001_create_tables.sql" }];

    let callCount = 0;
    const mockSql = Object.assign(
      vi.fn(async () => {
        callCount++;
        if (callCount === 2) return appliedRows;
        return [];
      }),
      {
        begin: vi.fn(async (cb: (tx: any) => Promise<void>) => {
          await cb(mockTx);
        }),
      }
    ) as any;

    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(
      ["001_create_tables.sql", "002_add_column.sql"] as any
    );
    vi.mocked(fs.readFileSync).mockReturnValue("ALTER TABLE test;");

    const { runMigrations } = await import("../src/db/migrate.js");
    const executed = await runMigrations(mockSql, "/fake/migrations");

    expect(executed).toEqual(["002_add_column.sql"]);
    expect(mockTx.unsafe).toHaveBeenCalledTimes(2);
  });

  it("returns empty array when no pending migrations", async () => {
    const appliedRows = [
      { name: "001_create_tables.sql" },
      { name: "002_add_column.sql" },
    ];

    let callCount = 0;
    const mockSql = Object.assign(
      vi.fn(async () => {
        callCount++;
        if (callCount === 2) return appliedRows;
        return [];
      }),
      {
        begin: vi.fn(),
      }
    ) as any;

    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(
      ["001_create_tables.sql", "002_add_column.sql"] as any
    );

    const { runMigrations } = await import("../src/db/migrate.js");
    const executed = await runMigrations(mockSql, "/fake/migrations");

    expect(executed).toEqual([]);
    expect(mockSql.begin).not.toHaveBeenCalled();
  });
});
