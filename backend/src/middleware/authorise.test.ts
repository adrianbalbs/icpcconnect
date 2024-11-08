import { describe, it, expect, beforeEach, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import { badRequest, unauthorizedError } from "../utils/errors";
import { authorise } from "../middleware/index.js";

describe("createAuthoriseMiddleware", () => {
  let req: Partial<Request & { role?: string }>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
    next = vi.fn();
  });

  it("should return 400 if role is missing", async () => {
    const middleware = authorise(["Admin"]);

    await middleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(badRequest.errorCode);
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next with unauthorized error if role is not allowed", async () => {
    req.role = "student";

    const middleware = authorise(["Admin"]);

    await middleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(unauthorizedError.errorCode);
    expect(res.send).toHaveBeenCalledWith(unauthorizedError);
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next when authorisation is successful", async () => {
    req.role = "Admin";

    const middleware = authorise(["Admin", "Student"]);

    await middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
