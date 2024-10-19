import { describe, it, expect, beforeEach, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import { createAuthoriseMiddleware } from "./authorise.js";
import { AuthService } from "../services/auth-service.js";
import { badRequest, HTTPError, unauthorizedError } from "../utils/errors";

describe("createAuthoriseMiddleware", () => {
  const mockAuthService = {} as AuthService;
  let req: Partial<Request & { userId?: string }>;
  let res: Partial<Response>;
  let next: NextFunction;
  let authoriseMiddleware: ReturnType<typeof createAuthoriseMiddleware>;

  beforeEach(() => {
    req = {};
    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
    next = vi.fn();
    authoriseMiddleware = createAuthoriseMiddleware(mockAuthService);
  });

  it("should return 400 if userId is missing", async () => {
    const middleware = authoriseMiddleware(["admin"]);

    await middleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(badRequest.errorCode);
    expect(res.send).toHaveBeenCalledWith({ message: "UserId is missing" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next with unauthorized error if role is not allowed", async () => {
    req.userId = "123";
    mockAuthService.getUserRole = vi.fn().mockResolvedValue("student");

    const middleware = authoriseMiddleware(["admin"]);

    await middleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(unauthorizedError.errorCode);
    expect(res.send).toHaveBeenCalledWith(unauthorizedError);
    expect(next).not.toHaveBeenCalled();
  });

  it("should pass the error to the next middleware if authService.getUserRole throws an error", async () => {
    req.userId = "123";
    const error = new HTTPError(unauthorizedError);
    mockAuthService.getUserRole = vi.fn().mockRejectedValue(error);

    const middleware = authoriseMiddleware(["admin"]);

    await middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("should call next when authorisation is successful", async () => {
    req.userId = "123";
    mockAuthService.getUserRole = vi.fn().mockResolvedValue("admin");

    const middleware = authoriseMiddleware(["admin", "student"]);

    await middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
