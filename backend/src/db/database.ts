import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";
import pg from "pg";
import dotenv from "dotenv";
import { getLogger } from "../utils/logger.js";

dotenv.config();

export type DatabaseConnection = NodePgDatabase<typeof schema>;

export interface Database {
  getConnection(): DatabaseConnection;
  endConnection(): Promise<void>;
}

export class DevDatabase implements Database {
  private logger = getLogger();
  private connectionString = process.env.DATABASE_URL;
  private pool: pg.Pool;
  private connection: DatabaseConnection;

  constructor() {
    this.logger.info("Establishing connection with Postgres");
    this.pool = new pg.Pool({
      connectionString: this.connectionString,
    });
    this.connection = drizzle(this.pool, { schema });
  }

  getConnection() {
    return this.connection;
  }

  async endConnection() {
    this.logger.info("Connection ended with Postgres");
    await this.pool.end();
  }
}
