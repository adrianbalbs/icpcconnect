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
) => {
  if (err instanceof HTTPError) {
    logger.error(`Received HTTP Error: ${formatError(err)}`);
    res.status(err.errorCode).json(getResponseFromHttpError(err));
  }
  res.status(internalServerError.errorCode).json(internalServerError);
};
