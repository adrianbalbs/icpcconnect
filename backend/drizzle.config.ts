import { defineConfig, Config } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.NODE_ENV === "test"
        ? process.env.TEST_DB
        : process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
} as Config);
