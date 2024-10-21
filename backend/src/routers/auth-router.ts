import { Router, Request, Response, NextFunction } from "express";
import { validateData } from "../middleware/validator-middleware.js";
import { AuthService, LoginRequest } from "../services/auth-service.js";
import { LoginRequestSchema } from "../schemas/index.js";
import dotenv from "dotenv";
import { clearCookies, setCookies } from "../utils/jwt.js";
dotenv.config();

export function authRouter(authService: AuthService) {
  return Router()
    .post(
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
          setCookies(res, result.token, result.refresh);
          res.status(200).send(result);
        } catch (err) {
          next(err);
        }
      },
    )
    .post("/logout", (_req: Request, res: Response) => {
      clearCookies(res);
      res.status(200).send();
    });
}
