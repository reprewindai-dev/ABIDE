import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export let pool: Pool | undefined;
export let db: NodePgDatabase<typeof schema> | undefined;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function isDatabaseConfigured(): boolean {
  return !isBrowser() && Boolean(process.env.DATABASE_URL?.trim());
}

export function assertDbConfiguredInProduction(): void {
  if (!isBrowser() && process.env.NODE_ENV === "production" && !process.env.DATABASE_URL?.trim()) {
    throw new Error("DATABASE_URL is required in production for ABIDE Postgres persistence.");
  }
}

export function getPool(): Pool {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured.");
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Keep ABIDE-owned objects first while allowing types/extensions such as
      // pgvector, which are commonly installed in the public schema, to resolve.
      options: "-c search_path=abide,public"
    });
  }
  return pool;
}

export function getDb(): NodePgDatabase<typeof schema> {
  if (!db) {
    db = drizzle(getPool(), { schema });
  }
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = undefined;
    db = undefined;
  }
}
