import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextFunction, Request, Response } from "express";
import { v4 } from "uuid";
import jwt from "jsonwebtoken";
import { authenticate } from "./authenticate.ts";
import { forbiddenError, unauthorizedError } from "../utils/errors.ts";

const JWT_SECRET = "placeholder-key";
const userId = v4();
const validToken = jwt.sign({ id: userId, role: "student" }, JWT_SECRET);
const invalidToken = "invalid-token";

describe("authentication middleware", () => {
  let req: Partial<Request & { userId?: string }>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      cookies: {},
      userId: undefined,
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  it("should authenticate the user with a valid token", () => {
    req.cookies = { id: validToken };
    authenticate(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(req.userId).toBe(userId);
  });

  it("should return 401 for missing token", () => {
    authenticate(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(unauthorizedError.errorCode);
    expect(res.send).toHaveBeenCalledWith({ unauthorizedError });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 for invalid token", () => {
    req.cookies = { id: invalidToken };
    authenticate(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(unauthorizedError.errorCode);
    expect(res.json).toHaveBeenCalledWith({
      message: "Forbidden",
      err: expect.anything(),
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 for token with invalid structure", () => {
    const malformedToken = jwt.sign({ id: "user123" }, JWT_SECRET);

    req.cookies = { id: malformedToken };

    authenticate(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(forbiddenError.errorCode);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid token strucutre",
      details: expect.any(Array),
    });
    expect(next).not.toHaveBeenCalled();
  });
});
