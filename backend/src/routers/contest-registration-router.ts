import { ContestRegistrationService } from "../services/index.js";
import { NextFunction, Request, Response, Router } from "express";
import { validateData } from "../middleware/index.js";
import {
  CreateContestRegistrationForm,
  CreateContestRegistrationFormSchema,
  UpdateContestRegistrationForm,
  UpdateContestRegistrationFormSchema,
} from "../schemas/index.js";

export function contestRegistrationRouter(
  contestRegistrationService: ContestRegistrationService,
) {
  return Router()
    .get(
      "/contest-registration",
      async (_req: Request, res: Response, next: NextFunction) => {
        try {
          const registrations =
            await contestRegistrationService.getAllStudentRegistrations();
          res.status(200).json(registrations);
        } catch (err) {
          next(err);
        }
      },
    )
    .get(
      "/contest-registration/:id",
      async (
        req: Request<{ id: string }, unknown>,
        res: Response,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        try {
          const registration =
            await contestRegistrationService.getRegistration(id);
          res.status(200).json(registration);
        } catch (err) {
          next(err);
        }
      },
    )
    .delete(
      "/contest-registration/:id",
      async (
        req: Request<{ id: string }, unknown>,
        res: Response,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        try {
          const result =
            await contestRegistrationService.deleteRegistration(id);
          res.status(200).json(result);
        } catch (err) {
          next(err);
        }
      },
    )
    .post(
      "/contest-registration",
      validateData(CreateContestRegistrationFormSchema, "body"),
      async (
        req: Request<
          Record<string, never>,
          unknown,
          CreateContestRegistrationForm
        >,
        res: Response,
        next: NextFunction,
      ) => {
        const contestRegistrationForm = req.body;
        try {
          const result = await contestRegistrationService.createRegistration(
            contestRegistrationForm,
          );
          res.status(200).json(result);
        } catch (err) {
          next(err);
        }
      },
    )
    .put(
      "/contest-registration/:id",
      validateData(UpdateContestRegistrationFormSchema, "body"),
      async (
        req: Request<
          Record<string, never>,
          unknown,
          UpdateContestRegistrationForm
        >,
        res: Response,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        const newRegistrationDetails = req.body;
        try {
          const result = await contestRegistrationService.updateRegistration(
            id,
            newRegistrationDetails,
          );
          res.status(200).json(result);
        } catch (err) {
          next(err);
        }
      },
    );
}
