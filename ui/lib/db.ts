import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL environment variable is not set. " +
      "Please set it in .env.local or your deployment environment."
  );
}

// Create a postgres client with connection pooling suitable for serverless
// Neon requires SSL mode, which is specified in the connection string
export const sql = postgres(connectionString, {
  // Connection pool settings for serverless environment
  max: 10, // Maximum connections in pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Timeout for establishing new connections
});
