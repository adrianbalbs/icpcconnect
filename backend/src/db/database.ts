import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";
import pg from "pg";
import dotenv from "dotenv";
import { getLogger } from "../utils/logger.js";
import { env, getDbConfig } from "../env.js";

dotenv.config();

export type DatabaseConnection = NodePgDatabase<typeof schema>;

export interface Database {
  getConnection(): DatabaseConnection;
  endConnection(): Promise<void>;
}

export class DevDatabase implements Database {
  private logger = getLogger();
  private pool: pg.Pool;
  private connection: DatabaseConnection;

  constructor() {
    this.logger.info("Establishing connection with Postgres");
    this.pool = new pg.Pool(getDbConfig(env));
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
