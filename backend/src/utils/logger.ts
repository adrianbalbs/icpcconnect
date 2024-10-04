import { createLogger, format, Logger, transports } from "winston";
import dotenv from "dotenv";
const { combine, timestamp, json } = format;

dotenv.config();

export const formatError = (err: Error | string): string => {
  if (err instanceof Error) {
    return `${err.name}: ${err.message}`;
  }
  return err;
};

export function getLogger(): Logger {
  return createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: combine(timestamp(), json()),
    transports: [
      new transports.Console({
        silent: process.env.NODE_ENV === "test" && !process.env.LOG_LEVEL,
      }),
    ],
  });
}
