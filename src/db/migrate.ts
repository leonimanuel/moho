import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type postgres from "postgres";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, "migrations");

export interface MigrationRunner {
  run(sql: postgres.Sql): Promise<string[]>;
}

export async function ensureMigrationsTable(sql: postgres.Sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function getAppliedMigrations(sql: postgres.Sql): Promise<string[]> {
  const rows = await sql<{ name: string }[]>`
    SELECT name FROM schema_migrations ORDER BY name
  `;
  return rows.map((r) => r.name);
}

export function getMigrationFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return (fs.readdirSync(dir) as string[])
    .filter((f) => f.endsWith(".sql"))
    .sort();
}

export async function runMigrations(
  sql: postgres.Sql,
  migrationsDir: string = MIGRATIONS_DIR
): Promise<string[]> {
  await ensureMigrationsTable(sql);
  const applied = await getAppliedMigrations(sql);
  const files = getMigrationFiles(migrationsDir);
  const pending = files.filter((f) => !applied.includes(f));
  const executed: string[] = [];

  for (const file of pending) {
    const filePath = path.join(migrationsDir, file);
    const content = fs.readFileSync(filePath, "utf-8");

    await sql.begin(async (tx) => {
      await tx.unsafe(content);
      await tx.unsafe("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
    });

    console.log(`Migration applied: ${file}`);
    executed.push(file);
  }

  if (executed.length === 0) {
    console.log("No pending migrations.");
  }

  return executed;
}
