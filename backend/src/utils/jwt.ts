import jwt from "jsonwebtoken";
import { __prod__ } from "./constants.js";
import { Response } from "express";

export const SECRET_KEY = process.env.JWT_SECRET || "placeholder-key";
export const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "another-placeholder-key";

const revokeCookieOpts = {
  httpOnly: true,
  secure: __prod__,
  sameSite: "lax",
  path: "/",
  domain: __prod__ ? `.${process.env.DOMAIN}` : "",
} as const;

const setCookieOpts = {
  ...revokeCookieOpts,
  maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
} as const;

export function createAuthTokens(
  id: string,
  role: string,
  refreshTokenVersion: number,
) {
  const token = jwt.sign({ id, role }, SECRET_KEY, {
    expiresIn: "15min",
  });

  const refresh = jwt.sign({ id, refreshTokenVersion }, REFRESH_TOKEN_SECRET, {
    expiresIn: "30d",
  });

  return { token, refresh };
}

export function setCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  res.cookie("id", accessToken, setCookieOpts);
  res.cookie("rid", refreshToken, setCookieOpts);
}

export function clearCookies(res: Response) {
  res.clearCookie("id", revokeCookieOpts);
  res.clearCookie("rid", revokeCookieOpts);
}
