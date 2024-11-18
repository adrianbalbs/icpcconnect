import { createLogger, format, Logger, transports } from "winston";
import { env } from "../env.js";
const { combine, timestamp, json } = format;

export const formatError = (err: Error | string): string => {
  if (err instanceof Error) {
    return `${err.name}: ${err.message}`;
  }
  return err;
};

export function getLogger(): Logger {
  return createLogger({
    level: env.LOG_LEVEL,
    format: combine(timestamp(), json()),
    transports: [
      new transports.Console({
        silent: process.env.NODE_ENV === "test" && env.LOG_LEVEL !== "debug",
      }),
    ],
  });
}
