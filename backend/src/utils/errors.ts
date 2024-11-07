import { IHttpError } from "../types/index.js";

export class HTTPError extends Error implements IHttpError {
  errorCode: number;
  message: string;
  constructor({ errorCode, message }: IHttpError) {
    super(`Error occured, status code: ${errorCode}, message: ${message}`);
    this.errorCode = errorCode;
    this.message = message;
  }
}

export const unauthorizedError: IHttpError = {
  errorCode: 401,
  message: "Unauthorized error occured",
};

export const forbiddenError: IHttpError = {
  errorCode: 403,
  message: "Access to resource is forbidden",
};

export const badRequest: IHttpError = {
  errorCode: 400,
  message: "Bad request",
};

export const notFoundError: IHttpError = {
  errorCode: 404,
  message: "Not found",
};

export const timeoutError: IHttpError = {
  errorCode: 408,
  message: "Timeout, the transaction hasn't completed yet, please retry",
};

export const internalServerError: IHttpError = {
  errorCode: 500,
  message: "An internal server error occurred",
};

export const getResponseFromHttpError = (error: HTTPError): IHttpError => {
  return {
    errorCode: error.errorCode,
    message: error.message,
  };
};
