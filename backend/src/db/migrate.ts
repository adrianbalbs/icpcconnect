import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Database } from "./database.js";
import { getLogger } from "../utils/logger.js";

export async function runMigrations() {
  const logger = getLogger();
  logger.info("Running migrations...");

  await migrate(Database.getConnection(), { migrationsFolder: "./drizzle" });
  logger.info("Migrations completed.");
}
