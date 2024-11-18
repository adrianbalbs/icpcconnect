import { NextFunction, Request, Response, Router } from "express";
// import { getLogger } from "../utils/logger.js";
import { AuthService, CodesService } from "../services/index.js";
import {
  pushCodeAuth,
  pushCodeCoach,
  pushCodeSiteCoord,
} from "../utils/createcode.js";
import { CreateAuthCodeRouteRequest } from "../schemas/codes-schema.js";
import { createAuthenticationMiddleware } from "../middleware/authenticate.js";
import { authorise } from "../middleware/authorise.js";

export function codesRouter(
  codesService: CodesService,
  authService: AuthService,
) {
  //   const logger = getLogger();
  const authenticate = createAuthenticationMiddleware(authService);
  return Router()
    .get(
      "/allRoleCodes",
      [authenticate, authorise(["Admin"])],
      async (_req: Request, res: Response, next: NextFunction) => {
        try {
          const codes = await codesService.getAllRoleCodes();
          res.status(200).json(codes);
        } catch (err) {
          next(err);
        }
      },
    )

    .get(
      "/allAuthCodes",
      [authenticate, authorise(["Admin"])],
      async (_req: Request, res: Response, next: NextFunction) => {
        try {
          const codes = await codesService.getAllAuthCodes();
          res.status(200).json(codes);
        } catch (err) {
          next(err);
        }
      },
    )

    .get(
      "/newCoachCode",
      [authenticate, authorise(["Admin"])],
      async (_req: Request, res: Response, next: NextFunction) => {
        try {
          const code = await pushCodeCoach(codesService);
          res.status(200).json(code);
        } catch (err) {
          next(err);
        }
      },
    )

    .get(
      "/newSiteCoordCode",
      [authenticate, authorise(["Admin"])],
      async (_req: Request, res: Response, next: NextFunction) => {
        try {
          const code = await pushCodeSiteCoord(codesService);
          res.status(200).json(code);
        } catch (err) {
          next(err);
        }
      },
    )

    .post(
      "/newAuthCode",
      [authenticate, authorise(["Admin"])],
      async (
        req: Request<
          Record<string, never>,
          unknown,
          CreateAuthCodeRouteRequest
        >,
        res: Response,
        next: NextFunction,
      ) => {
        const { email } = req.body;
        try {
          const code = await pushCodeAuth(codesService, email);
          res.status(200).json(code);
        } catch (err) {
          next(err);
        }
      },
    );
}
