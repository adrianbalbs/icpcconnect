import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { badRequest } from "../utils/errors.js";

export function validateData<T extends ZodSchema>(
  schema: T,
  property: "body" | "query",
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[property]);
    if (!result.success) {
      const errorMessages = result.error.errors.map((issue) => ({
        message: `${issue.path.join(".")} is ${issue.message}`,
      }));
      res.status(badRequest.errorCode).json({
        error: "Invalid data",
        details: errorMessages,
      });
      return;
    }
    next();
  };
}
