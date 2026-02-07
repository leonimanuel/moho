import postgres from "postgres";

export function createClient(connectionString: string) {
  const sql = postgres(connectionString);
  return sql;
}

export async function disconnect(sql: postgres.Sql) {
  await sql.end();
}
