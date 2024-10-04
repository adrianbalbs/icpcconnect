import { ErrorRequestHandler } from "express";
import {
  getResponseFromHttpError,
  HTTPError,
  internalServerError,
} from "../utils/errors.js";

export const errorHandlerMiddleware: ErrorRequestHandler = (
  err: Error | HTTPError,
  _req,
  res,
  _next,
) => {
  if (err instanceof HTTPError) {
    res.status(err.errorCode).json(getResponseFromHttpError(err));
  }
  res.status(internalServerError.errorCode).json(internalServerError);
};
