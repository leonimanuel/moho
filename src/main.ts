import { parseCli } from "./cli.js";
import { resolveConfig } from "./config.js";
import { createClient, disconnect } from "./db/client.js";
import { runMigrations } from "./db/migrate.js";
import { XClient } from "./api/x-client.js";
import { runPipeline } from "./ingestion/pipeline.js";
import { logError } from "./logger.js";

async function main() {
  const cliArgs = parseCli(process.argv);
  const config = resolveConfig(cliArgs);

  const sql = createClient(config.databaseUrl);

  try {
    await runMigrations(sql);
    const xClient = new XClient(config.bearerToken);
    await runPipeline(
      {
        username: config.username,
        userId: config.userId,
        startDate: config.startDate,
        endDate: config.endDate,
      },
      xClient,
      sql,
    );
  } finally {
    await disconnect(sql);
  }
}

main().catch((err) => {
  logError(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
