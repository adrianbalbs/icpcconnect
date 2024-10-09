import { Router, Request, Response, NextFunction } from "express";
import { validateData } from "../middleware/validator-middleware.js";
import {
    AuthService,
    LoginRequest
} from "../services/auth-service.js";
import {
    LoginRequestSchema
} from "../schemas/index.js"

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
          res.status(200).json(result);
        } catch (err) {
          next(err);
        }
      },
    );
}
