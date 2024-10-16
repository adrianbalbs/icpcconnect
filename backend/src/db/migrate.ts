import { migrate } from "drizzle-orm/node-postgres/migrator";
import { DatabaseConnection } from "./database.js";
import { getLogger } from "../utils/logger.js";

export async function runMigrations(db: DatabaseConnection) {
  const logger = getLogger();
  logger.info("Running migrations...");

  await migrate(db, { migrationsFolder: "./drizzle" });
  logger.info("Migrations completed.");
}
