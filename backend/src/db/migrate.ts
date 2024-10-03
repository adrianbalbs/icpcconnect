import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Database } from "./index.js";

await migrate(Database.getConnection(), { migrationsFolder: "./drizzle" });

await Database.endConnection();
