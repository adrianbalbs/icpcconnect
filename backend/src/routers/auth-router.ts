import { Router, Request, Response, NextFunction } from "express";
import { validateData } from "../middleware/validator-middleware.js";
import { AuthService } from "../services/auth-service.js";
import { LoginRequest } from "../schemas/index.js";
import { LoginRequestSchema } from "../schemas/index.js";
import { clearCookies, setCookies } from "../utils/jwt.js";
import { createAuthenticationMiddleware } from "../middleware/authenticate.js";
import { HTTPError, unauthorizedError } from "../utils/errors.js";

export function authRouter(authService: AuthService) {
  const authenticate = createAuthenticationMiddleware(authService);
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
          res.status(200).send(result.userInfo);
        } catch (err) {
          next(err);
        }
      },
    )
    .post("/logout", authenticate, (_req: Request, res: Response) => {
      clearCookies(res);
      res.status(200).send();
    })
    .get(
      "/me",
      authenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          // Hypothetically the authenticate middleware should return if this is ever undefined
          if (!req.userId) {
            throw new HTTPError(unauthorizedError);
          }
          const result = await authService.getUserAuthInfo(req.userId);
          res.status(200).send(result);
        } catch (err) {
          next(err);
        }
      },
    );
}
