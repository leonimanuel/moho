import { Command } from "commander";

export interface CliArgs {
  username?: string;
  userId?: string;
  startDate: string;
  endDate: string;
  databaseUrl?: string;
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/;

function validateDate(value: string, name: string): string {
  if (!ISO_DATE_RE.test(value)) {
    throw new Error(`${name} must be a valid ISO 8601 date (e.g. 2024-01-01 or 2024-01-01T00:00:00Z)`);
  }
  if (isNaN(Date.parse(value))) {
    throw new Error(`${name} is not a valid date`);
  }
  return value;
}

export function parseCli(argv: string[]): CliArgs {
  const program = new Command();

  program
    .name("x-pipeline")
    .description("Ingest X (Twitter) posts into a Postgres database")
    .requiredOption("--start-date <date>", "Start date in ISO 8601 format")
    .requiredOption("--end-date <date>", "End date in ISO 8601 format")
    .option("--username <username>", "X username to fetch posts for")
    .option("--user-id <id>", "X user ID to fetch posts for")
    .option("--database-url <url>", "Postgres connection string");

  program.parse(argv);
  const opts = program.opts();

  const username = opts.username as string | undefined;
  const userId = opts.userId as string | undefined;

  if (!username && !userId) {
    program.error("At least one of --username or --user-id is required");
  }

  const startDate = validateDate(opts.startDate as string, "--start-date");
  const endDate = validateDate(opts.endDate as string, "--end-date");

  return {
    username,
    userId,
    startDate,
    endDate,
    databaseUrl: opts.databaseUrl as string | undefined,
  };
}
