import { z } from "zod";
import { NextFunction, Request, Response } from "express";
import { validateData } from "./validator-middleware.js";
import { badRequest } from "../utils/errors.js";

const SampleSchema = z.object({
  name: z.string().min(1),
  age: z.number().min(0),
});

describe("validateData middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("should call next() if the data is valid", () => {
    req.body = { name: "Adrian Balbalosa", age: 23 };
    const middleware = validateData(SampleSchema, "body");
    middleware(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("it should return a bad request error if the data is invalid", () => {
    req.body = { name: "", age: -5 };
    const middleware = validateData(SampleSchema, "body");
    middleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(badRequest.errorCode);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid data",
      details: [
        { message: "name is String must contain at least 1 character(s)" },
        { message: "age is Number must be greater than or equal to 0" },
      ],
    });
  });
});
