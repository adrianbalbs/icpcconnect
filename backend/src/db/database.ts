import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";
import pg from "pg";
import dotenv from "dotenv";
import { getLogger } from "../utils/logger.js";

dotenv.config();

export type DatabaseConnection = ReturnType<typeof Database.getConnection>;

export class Database {
  private static instance: NodePgDatabase<typeof schema> | null;
  private static pool: pg.Pool;
  private static logger = getLogger();

  static getConnection() {
    if (!Database.instance) {
      Database.logger.info("Establishing pool connection with Postgres");
      Database.pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
      });
    }
    Database.instance = drizzle(Database.pool, { schema });

    return Database.instance;
  }

  static async endConnection() {
    await Database.pool.end();
  }
}
