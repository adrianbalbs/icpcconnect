import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextFunction, Request, Response } from "express";
import { v4 } from "uuid";
import jwt from "jsonwebtoken";
import { createAuthenticationMiddleware } from "./authenticate.ts";
import { unauthorizedError } from "../utils/errors.ts";
import { AuthService } from "../services/auth-service.ts";
import { env } from "../env.ts";

describe("authentication middleware", () => {
  const JWT_SECRET = env.JWT_SECRET;
  const REFRESH_TOKEN_SECRET = env.REFRESH_TOKEN_SECRET;
  const userId = v4();
  const validAccessToken = jwt.sign(
    { id: userId, role: "student" },
    JWT_SECRET,
  );
  const validRefreshToken = jwt.sign(
    { id: userId, refreshTokenVersion: 1 },
    REFRESH_TOKEN_SECRET,
  );
  const invalidToken = "invalid-token";

  let req: Partial<Request & { role?: string }>;
  let res: Partial<Response>;
  let next: NextFunction;
  let authService: Partial<AuthService>;
  let authenticate: ReturnType<typeof createAuthenticationMiddleware>;

  beforeEach(() => {
    req = {
      cookies: {},
      role: undefined,
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn(),
      cookie: vi.fn(),
    };
    next = vi.fn();
    authService = {
      getUserAuthInfo: vi.fn().mockResolvedValue({
        role: "student",
        email: "student@ad.com",
        id: userId,
        refreshTokenVersion: 1,
      }),
    };
    authenticate = createAuthenticationMiddleware(authService as AuthService);

    vi.clearAllMocks();
  });

  it("should authenticate the user with a valid access token", () => {
    req.cookies = { id: validAccessToken };
    authenticate(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(req.role).toBe("student");
  });

  it("should return 401 for missing access token", () => {
    authenticate(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(unauthorizedError.errorCode);
    expect(res.send).toHaveBeenCalledWith(unauthorizedError);
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 for invalid access token", () => {
    req.cookies = { id: invalidToken };
    authenticate(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(unauthorizedError.errorCode);
    expect(res.send).toHaveBeenCalledWith(unauthorizedError);
    expect(next).not.toHaveBeenCalled();
  });

  it("should authenticate the user with a valid refresh token if access token is invalid", async () => {
    req.cookies = { id: invalidToken, rid: validRefreshToken };
    await authenticate(req as Request, res as Response, next);

    expect(authService.getUserAuthInfo).toHaveBeenCalledWith(userId);
    expect(res.cookie).toHaveBeenCalledTimes(2);
    expect(next).toHaveBeenCalled();
    expect(req.role).toBe("student");
  });

  it("should return 401 for missing refresh token if access token is invalid", async () => {
    req.cookies = { id: invalidToken };
    await authenticate(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(unauthorizedError.errorCode);
    expect(res.send).toHaveBeenCalledWith(unauthorizedError);
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 for invalid refresh token", async () => {
    req.cookies = { id: invalidToken, rid: invalidToken };
    await authenticate(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(unauthorizedError.errorCode);
    expect(res.send).toHaveBeenCalledWith(unauthorizedError);
    expect(next).not.toHaveBeenCalled();
  });
});
