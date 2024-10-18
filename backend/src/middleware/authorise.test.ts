import { describe, it, expect, beforeEach, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import { authorise } from "./authorise.js";
import { AuthService } from "../services/auth-service.js";
import { HTTPError, unauthorizedError } from "../utils/errors";

describe("authorise middleware", () => {
  const mockAuthService = {} as AuthService;
  let req: Partial<Request & { userId?: string }>;
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

  it("should return 400 if userId is missing", async () => {
    const middleware = authorise(mockAuthService, ["admin"]);

    await middleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: "UserId is missing" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next with unauthorized error if role is not allowed", async () => {
    req.userId = "123";
    mockAuthService.getUserRole = vi.fn().mockResolvedValue("student");

    const middleware = authorise(mockAuthService, ["admin"]);

    await middleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith(unauthorizedError);
  });

  it("should pass the error to the next middleware if the user is not found", async () => {
    req.userId = "123";
    const error = new HTTPError(unauthorizedError);
    mockAuthService.getUserRole = vi.fn().mockRejectedValue(error);

    const middleware = authorise(mockAuthService, ["admin"]);
    await middleware(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  it("should call next when authorisation is successful", async () => {
    req.userId = "123";
    mockAuthService.getUserRole = vi.fn().mockResolvedValue("admin");

    const middleware = authorise(mockAuthService, ["admin", "student"]);

    await middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });
});
