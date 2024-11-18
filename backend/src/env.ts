import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const BaseEnvSchema = z.object({
  NODE_ENV: z.enum(["dev", "prod", "test"]),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string().transform(Number).pipe(z.number().min(0).max(65535)),
  SMTP_SERVER: z.string(),
  EMAIL_USER: z.string().email(),
  EMAIL_PASSWORD: z.string(),
  EMAIL_PORT: z.string().transform(Number).pipe(z.number().min(0).max(65535)),
  JWT_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(10),
});

const ProdEnvSchema = BaseEnvSchema.extend({
  DATABASE_URL: z.string().url(),
  FRONTEND_URL: z.string().url(),
  PORT: z.string().transform(Number).pipe(z.number().min(0).max(65535)),
});

const TestEnvSchema = BaseEnvSchema.extend({
  PG_TEST_USER: z.string(),
  PG_TEST_HOST: z.string(),
  PG_TEST_PW: z.string(),
  PG_TEST_DB: z.string(),
  PG_TEST_PORT: z.string().transform(Number).pipe(z.number().min(0).max(65535)),
});

type ProdEnv = z.infer<typeof ProdEnvSchema>;
type TestEnv = z.infer<typeof TestEnvSchema>;
type Env = ProdEnv | TestEnv;

export const isTestEnv = (env: Env): env is TestEnv => env.NODE_ENV === "test";
export const isProdEnv = (env: Env): env is ProdEnv => env.NODE_ENV !== "test";

type TestDBConfig = {
  user: string;
  host: string;
  password: string;
  database: string;
  port: number;
};

type ProdDBConfig = {
  connectionString: string;
};

type DBConfig = TestDBConfig | ProdDBConfig;

export function getDbConfig(env: Env, dbName?: string): DBConfig {
  if (isTestEnv(env)) {
    return {
      user: env.PG_TEST_USER,
      host: env.PG_TEST_HOST,
      password: env.PG_TEST_PW,
      database: dbName || env.PG_TEST_DB,
      port: env.PG_TEST_PORT,
    };
  }
  return {
    connectionString: env.DATABASE_URL,
  };
}

function loadEnvConfig(): Env {
  try {
    switch (process.env.NODE_ENV) {
      case "test":
        return Object.freeze(TestEnvSchema.parse(process.env));
      case "prod":
      case "dev":
        return Object.freeze(ProdEnvSchema.parse(process.env));
      default:
        throw new Error(`Unknown NODE_ENV: ${process.env.NODE_ENV}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((issue) => issue.path.join("."));
      throw new Error(
        `Missing or invalid environment variables: ${missingVars.join(", ")}`,
      );
    }
    throw error;
  }
}

export const env = loadEnvConfig();
