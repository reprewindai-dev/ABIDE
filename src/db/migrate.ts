import { migrate } from "drizzle-orm/node-postgres/migrator";
import { assertDbConfiguredInProduction, getDb, isDatabaseConfigured } from "./client";

assertDbConfiguredInProduction();
if (!isDatabaseConfigured()) {
  throw new Error("DATABASE_URL is required to run database migrations.");
}

await migrate(getDb(), { migrationsFolder: "drizzle" });
console.log("ABIDE Postgres migrations applied.");
