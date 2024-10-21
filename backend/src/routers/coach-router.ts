import { Router, Request, Response, NextFunction } from "express";
import { AuthService, CoachService } from "../services/index.js";
import { validateData } from "../middleware/validator-middleware.js";
import {
  CreateCoachRequest,
  CreateCoachRequestSchema,
  UpdateCoachRequest,
  UpdateCoachRequestSchema,
} from "../schemas/user-schema.js";
import { createAuthenticationMiddleware } from "../middleware/authenticate.js";
import { authorise } from "../middleware/authorise.js";

export function coachRouter(
  coachService: CoachService,
  authService: AuthService,
) {
  const authenticate = createAuthenticationMiddleware(authService);
  return Router()
    .get(
      "/",
      [authenticate, authorise(["admin", "site_coordinator"])],
      async (_req: Request, res: Response, next: NextFunction) => {
        try {
          const coaches = await coachService.getAllCoaches();
          res.status(200).json(coaches);
        } catch (err) {
          next(err);
        }
      },
    )
    .get(
      "/:id",
      [authenticate, authorise(["admin", "coach"])],
      async (
        req: Request<{ id: string }, unknown>,
        res: Response,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        try {
          const coach = await coachService.getCoachById(id);
          res.status(200).json(coach);
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
          const result = await coachService.deleteCoach(id);
          res.status(200).json(result);
        } catch (err) {
          next(err);
        }
      },
    )
    .post(
      "/",
      validateData(CreateCoachRequestSchema, "body"),
      async (
        req: Request<Record<string, never>, unknown, CreateCoachRequest>,
        res: Response,
        next: NextFunction,
      ) => {
        const coachDetails = req.body;
        try {
          const result = await coachService.createCoach(coachDetails);
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
        authorise(["admin", "coach"]),
        validateData(UpdateCoachRequestSchema, "body"),
      ],
      async (
        req: Request<Record<string, never>, unknown, UpdateCoachRequest>,
        res: Response,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        const newCoachDetails = req.body;
        try {
          const result = await coachService.updateCoach(id, newCoachDetails);
          res.status(200).json(result);
        } catch (err) {
          next(err);
        }
      },
    );
}
