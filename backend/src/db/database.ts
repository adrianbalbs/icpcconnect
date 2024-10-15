import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";
import pg from "pg";
import dotenv from "dotenv";
import { getLogger } from "../utils/logger.js";

dotenv.config();

export type DatabaseConnection = NodePgDatabase<typeof schema>;

export class Database {
  private static instance: NodePgDatabase<typeof schema> | null;
  private static pool: pg.Pool;
  private static logger = getLogger();
  private static connectionString =
    process.env.NODE_ENV === "test"
      ? process.env.TEST_DB
      : process.env.DATABASE_URL;

  static getConnection() {
    if (!Database.instance) {
      Database.logger.info(
        `Establishing pool connection with Postgres on ${Database.connectionString}`,
      );
      Database.pool = new pg.Pool({
        connectionString: Database.connectionString,
      });
    }
    Database.instance = drizzle(Database.pool, { schema });

    return Database.instance;
  }

  static async endConnection() {
    Database.logger.info("Connection ended with Postgres");
    await Database.pool.end();
  }
}
