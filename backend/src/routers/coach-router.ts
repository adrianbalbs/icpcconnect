import { Router, Request, Response, NextFunction } from "express";
import { CoachService } from "../services/index.js";
import { validateData } from "../middleware/validator-middleware.js";
import {
  CreateCoachRequest,
  CreateCoachRequestSchema,
  UpdateCoachRequest,
  UpdateCoachRequestSchema,
} from "../schemas/user-schema.js";

export function coachRouter(coachService: CoachService) {
  return Router()
    .get(
      "/coaches",
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
      "/coaches/:id",
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
    .get(
      "/coaches/:id/studentEmails",
      async (
        req: Request<{ id: string }, unknown>,
        res: Response,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        try {
          const emails = await coachService.getStudentEmails(id);
          res.status(200).json(emails);
        } catch (err) {
          next(err);
        }
      },
    )
    .delete(
      "/coaches/:id",
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
      "/coaches",
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
      "/coaches/:id",
      validateData(UpdateCoachRequestSchema, "body"),
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
