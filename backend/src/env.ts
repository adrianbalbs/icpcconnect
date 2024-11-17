import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().transform(Number).pipe(z.number().min(0).max(65535)),
  NODE_ENV: z.enum(["dev", "prod", "test"]),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string().transform(Number).pipe(z.number().min(0).max(65535)),
  JWT_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  FRONTEND_URL: z.string().url(),
});

const devProdEnvSchema = envSchema.extend({
  DATABASE_URL: z.string().url(),
});

const testEnvSchema = envSchema.extend({
  PG_TEST_USER: z.string(),
  PG_TEST_HOST: z.string(),
  PG_TEST_PW: z.string(),
  PG_TEST_DB: z.string(),
  PG_TEST_PORT: z.string().transform(Number).pipe(z.number().min(0).max(65535)),
});

type Env = z.infer<typeof devProdEnvSchema> | z.infer<typeof testEnvSchema>;

function loadEnvConfig(): Env {
  const nodeEnv = process.env.NODE_ENV || "dev";

  try {
    if (nodeEnv === "test") {
      const config = testEnvSchema.parse({
        ...process.env,
      });

      if (config.NODE_ENV === "test") {
        console.log("Test environment loaded");
      }

      return Object.freeze(config);
    }

    const config = devProdEnvSchema.parse(process.env);

    if (config.NODE_ENV === "dev") {
      console.log("Development environment loaded");
    }

    return Object.freeze(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        `Invalid environment variables for ${nodeEnv} environment:`,
      );
      error.issues.forEach((issue) => {
        console.error(`- ${issue.path.join(".")}: ${issue.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

export const env = loadEnvConfig();
