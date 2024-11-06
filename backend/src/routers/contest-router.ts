import { Router, Request, Response, NextFunction } from "express";
import { createAuthenticationMiddleware } from "src/middleware/authenticate.js";
import { authorise } from "src/middleware/authorise.js";
import { validateData } from "src/middleware/validator-middleware.js";
import { AuthService } from "src/services/auth-service.js";
import {
  ContestService,
  CreateContest,
  CreateContestSchema,
} from "src/services/contest-service.js";

export function contestRouter(
  contestService: ContestService,
  authService: AuthService,
) {
  const authenticate = createAuthenticationMiddleware(authService);
  return Router()
    .get(
      "/",
      [
        authenticate,
        authorise(["admin", "site_coordinator", "student", "coach"]),
      ],
      async (_req: Request, res: Response, next: NextFunction) => {
        try {
          const contests = await contestService.getAll();
          res.status(200).json(contests);
        } catch (err) {
          next(err);
        }
      },
    )
    .get(
      "/:id",
      [
        authenticate,
        authorise(["admin", "site_coordinator", "student", "coach"]),
      ],
      async (
        req: Request<{ id: string }, unknown>,
        res: Response,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        try {
          const contest = await contestService.get(id);
          res.status(200).json(contest);
        } catch (err) {
          next(err);
        }
      },
    )
    .delete(
      "/:id",
      [authenticate, authorise(["admin"])],
      async (
        req: Request<{ id: string }, unknown>,
        res: Response,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        try {
          const contest = await contestService.delete(id);
          res.status(200).json(contest);
        } catch (err) {
          next(err);
        }
      },
    )
    .post(
      "/",
      [
        authenticate,
        authorise(["admin"]),
        validateData(CreateContestSchema, "body"),
      ],
      async (
        req: Request<unknown, unknown, CreateContest>,
        res: Response,
        next: NextFunction,
      ) => {
        const payload = req.body;
        try {
          const result = await contestService.create(payload);
          res.status(200).json(result);
        } catch (err) {
          next(err);
        }
      },
    )
    .put(
      "/:id",
      [
        authenticate,
        authorise(["admin"]),
        validateData(CreateContestSchema, "body"),
      ],
      async (
        req: Request<{ id: string }, unknown, CreateContest>,
        res: Response,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        const payload = req.body;
        try {
          const result = await contestService.update(id, payload);
          res.status(200).json(result);
        } catch (err) {
          next(err);
        }
      },
    );
}
