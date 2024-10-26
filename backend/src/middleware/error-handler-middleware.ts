import { ErrorRequestHandler } from "express";
import {
  getResponseFromHttpError,
  HTTPError,
  internalServerError,
} from "../utils/errors.js";
import { formatError, getLogger } from "../utils/logger.js";

const logger = getLogger();

export const errorHandlerMiddleware: ErrorRequestHandler = (
  err: Error | HTTPError,
  _req,
  res,
  _next, // eslint-disable-line @typescript-eslint/no-unused-vars
) => {
  logger.error(`Received ${formatError(err)}`);
  if (err instanceof HTTPError) {
    res.status(err.errorCode).json(getResponseFromHttpError(err));
    return;
  }
  res.status(internalServerError.errorCode).json(internalServerError);
};
