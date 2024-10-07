import { Router, Request, Response, NextFunction } from "express";
import { CoachService } from "../services/index.js";
import { getLogger } from "../utils/logger.js";
import { validateData } from "../middleware/validator-middleware.js";
import {
  CreateCoachRequest,
  CreateCoachRequestSchema,
  UpdateCoachRequest,
  UpdateCoachRequestSchema,
} from "../schemas/user-schema.js";

export function coachRouter(coachService: CoachService) {
  const logger = getLogger();
  return Router()
    .get(
      "/coaches",
      async (_req: Request, res: Response, next: NextFunction) => {},
    )
    .get(
      "/coaches/:id",
      async (
        req: Request<{ id: string }, unknown>,
        res: Response,
        next: NextFunction,
      ) => {},
    )
    .delete(
      "/coaches/:id",
      async (
        req: Request<{ id: string }, unknown>,
        res: Response,
        next: NextFunction,
      ) => {},
    )
    .post(
      "/coaches",
      validateData(CreateCoachRequestSchema, "body"),
      async (
        req: Request<Record<string, never>, unknown, CreateCoachRequest>,
        res: Response,
        next: NextFunction,
      ) => {},
    )
    .put(
      "/coaches/:id",
      validateData(UpdateCoachRequestSchema, "body"),
      async (
        req: Request<Record<string, never>, unknown, UpdateCoachRequest>,
        res: Response,
        next: NextFunction,
      ) => {},
    );
}
