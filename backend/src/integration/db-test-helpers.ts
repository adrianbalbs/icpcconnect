import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../db/schema.js";
import { v4 as uuidv4 } from "uuid";
import pg from "pg";
import { runMigrations } from "../db/migrate.js";
import { seedTest } from "../db/index.js";
import { env, getDbConfig, isTestEnv } from "../env.js";
const { Pool } = pg;

async function createTestDatabase(dbName: string) {
  if (!isTestEnv(env)) {
    throw new Error("Cannot create test database in a non-test environment");
  }

  const pool = new Pool(getDbConfig(env));

  await pool.query(`CREATE DATABASE ${dbName} WITH TEMPLATE template1`);
  await pool.end();
}

export async function dropTestDatabase() {
  if (!isTestEnv(env)) {
    throw new Error("Cannot drop test database in a non-test environment");
  }

  const pool = new Pool(getDbConfig(env));

  // this causes an error where the db is being used, not too sure of a fix yet
  // await pool.query(`DROP DATABASE IF EXISTS ${dbName}`);
  await pool.end();
}

export async function setupTestDatabase() {
  if (!isTestEnv(env)) {
    throw new Error("Cannot drop test database in a non-test environment");
  }

  const testDbName = `test_db_${uuidv4()}`.replace(/-/g, "_");
  await createTestDatabase(testDbName);

  const pool = new pg.Pool(getDbConfig(env, testDbName));

  const db = drizzle(pool, { schema });
  await runMigrations(db);
  await seedTest(db);
  return { db, testDbName };
}
