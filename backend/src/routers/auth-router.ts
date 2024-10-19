import { Router, Request, Response, NextFunction } from "express";
import { validateData } from "../middleware/validator-middleware.js";
import { AuthService, LoginRequest } from "../services/auth-service.js";
import { LoginRequestSchema } from "../schemas/index.js";
import { __prod__ } from "../utils/constants.js";
import dotenv from "dotenv";
dotenv.config();

export function authRouter(authService: AuthService) {
  const cookieOpts = {
    httpOnly: true,
    secure: __prod__,
    sameSite: "lax",
    path: "/",
    domain: __prod__ ? `.${process.env.DOMAIN}` : "",
    maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
  } as const;

  return Router().post(
    "/login",
    validateData(LoginRequestSchema, "body"),
    async (
      req: Request<Record<string, never>, unknown, LoginRequest>,
      res: Response,
      next: NextFunction,
    ) => {
      const loginDetails = req.body;
      try {
        const result = await authService.login(loginDetails);
        res.cookie("id", result.token, cookieOpts);
        res.cookie("rid", result.refresh, cookieOpts);
        res.status(200).send(result);
      } catch (err) {
        next(err);
      }
    },
  );
}
