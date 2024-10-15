import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../db/schema.js";
import { v4 as uuidv4 } from "uuid";
import pg from "pg";
import { runMigrations } from "../db/migrate.js";
import { seedTest } from "../db/seed.js";
const { Pool } = pg;

async function createTestDatabase(dbName: string) {
  const pool = new Pool({
    user: "testuser",
    host: "localhost",
    database: "testdb",
    password: "testpassword",
    port: 5556,
  });

  await pool.query(`CREATE DATABASE ${dbName} WITH TEMPLATE template_test_db`);
  await pool.end();
}

export async function dropTestDatabase() {
  const pool = new Pool({
    user: "testuser",
    host: "localhost",
    database: "testdb",
    password: "testpassword",
    port: 5556,
  });

  // this causes an error where the db is being used, not too sure of a fix yet
  // await pool.query(`DROP DATABASE IF EXISTS ${dbName}`);
  await pool.end();
}

export async function setupTestDatabase() {
  const testDbName = `test_db_${uuidv4()}`.replace(/-/g, "_");
  await createTestDatabase(testDbName);

  const pool = new pg.Pool({
    host: "localhost",
    user: "testuser",
    password: "testpassword",
    database: testDbName,
    port: 5556,
  });

  const db = drizzle(pool, { schema });
  await runMigrations(db);
  await seedTest(db);
  return { db, testDbName };
}
