import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Database } from "./database.js";

await migrate(Database.getConnection(), { migrationsFolder: "./drizzle" });

await Database.endConnection();
