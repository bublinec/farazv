import "server-only";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

let pool: Pool | undefined;
let db: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getPool() {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");
  pool = new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 8_000,
    statement_timeout: 15_000,
    allowExitOnIdle: true
  });
  pool.on("error", () => console.error("Database connection unavailable"));
  return pool;
}
export function getDb() {
  return (db ??= drizzle(getPool(), { schema }));
}
export async function closeDb() {
  if (pool) await pool.end();
  pool = undefined;
  db = undefined;
}
