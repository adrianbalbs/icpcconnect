import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { unauthorizedError } from "../utils/errors.js";
import { getLogger } from "../utils/logger.js";
import { UserRole } from "../schemas/user-schema.js";
import { AuthService } from "../services/auth-service.js";
import { createAuthTokens, setCookies } from "../utils/jwt.js";

export type AccessTokenPayload = {
  id: string;
  role: UserRole;
};

export type RefreshTokenPayload = {
  id: string;
  refreshTokenVersion: number;
};

export const createAuthenticationMiddleware = (authService: AuthService) => {
  dotenv.config();
  const JWT_SECRET = process.env.JWT_SECRET || "placeholder-key";
  const REFRESH_TOKEN_SECRET =
    process.env.REFRESH_TOKEN_SECRET || "another-placeholder-key";
  const logger = getLogger();

  const verifyAccessToken = (token: string) => {
    logger.debug("Verifying access token");
    try {
      return <AccessTokenPayload>jwt.verify(token, JWT_SECRET);
    } catch {
      logger.debug("Access token invalid");
      return null;
    }
  };

  const verifyRefreshToken = async (token: string) => {
    logger.debug("Verifying refresh token");
    try {
      const decodedRefresh = <RefreshTokenPayload>(
        jwt.verify(token, REFRESH_TOKEN_SECRET)
      );

      const { refreshTokenVersion, role, id } =
        await authService.getUserAuthInfo(decodedRefresh.id);

      return refreshTokenVersion === decodedRefresh.refreshTokenVersion
        ? { refreshTokenVersion, role, id }
        : null;
    } catch {
      logger.debug("Id associated with refresh token not valid");
      return null;
    }
  };

  return async (req: Request, res: Response, next: NextFunction) => {
    logger.debug("Authenticating request");
    if (!Object.keys(req.cookies).includes("id")) {
      res.status(unauthorizedError.errorCode).send(unauthorizedError);
      return;
    }
    const accessToken = req.cookies["id"];

    const accessPayload = verifyAccessToken(accessToken);
    if (accessPayload) {
      req.userId = accessPayload.id;
      req.role = accessPayload.role;
      next();
      return;
    }

    // If verifying the acces token fails, check refresh token
    if (!Object.keys(req.cookies).includes("rid")) {
      res.status(unauthorizedError.errorCode).send(unauthorizedError);
      return;
    }
    const refreshToken = req.cookies["rid"];
    const userAuthInfo = await verifyRefreshToken(refreshToken);
    if (!userAuthInfo) {
      logger.debug("Refresh token is invalid");
      res.status(unauthorizedError.errorCode).send(unauthorizedError);
      return;
    }

    const newTokens = createAuthTokens(
      userAuthInfo.id,
      userAuthInfo.role,
      userAuthInfo.refreshTokenVersion,
    );
    setCookies(res, newTokens.token, newTokens.refresh);

    req.userId = userAuthInfo.id;
    req.role = userAuthInfo.role;
    next();
  };
};
