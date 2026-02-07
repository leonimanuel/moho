import type { CliArgs } from "./cli.js";

export interface Config {
  username?: string;
  userId?: string;
  startDate: string;
  endDate: string;
  databaseUrl: string;
  bearerToken: string;
  apiKey?: string;
  apiSecret?: string;
}

export function resolveConfig(cliArgs: CliArgs): Config {
  const databaseUrl = cliArgs.databaseUrl ?? process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("Database URL is required. Provide --database-url or set DATABASE_URL env var.");
  }

  const bearerToken = process.env.X_BEARER_TOKEN;
  if (!bearerToken) {
    throw new Error("X_BEARER_TOKEN environment variable is required.");
  }

  return {
    username: cliArgs.username,
    userId: cliArgs.userId,
    startDate: cliArgs.startDate,
    endDate: cliArgs.endDate,
    databaseUrl,
    bearerToken,
    apiKey: process.env.X_API_KEY,
    apiSecret: process.env.X_API_SECRET,
  };
}
