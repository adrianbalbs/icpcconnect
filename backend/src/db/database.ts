import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

export class Database {
  private static instance: NodePgDatabase<typeof schema> | null;
  private static pool: pg.Pool;

  static getConnection() {
    if (!Database.instance) {
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
