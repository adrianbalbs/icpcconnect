import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

class Database {
  private static instance: ReturnType<typeof drizzle> | null;
  private static pool: pg.Pool;

  static getConnection() {
    if (!Database.instance) {
      Database.pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
      });
    }
    Database.instance = drizzle(Database.pool);
    return Database.instance;
  }

  static async endConnection() {
    await Database.pool.end();
  }
}

export default Database;
