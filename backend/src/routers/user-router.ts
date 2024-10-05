import { NextFunction, Request, Response, Router } from "express";
import { UserService } from "../services/user-service.js";
import { validateData } from "../middleware/index.js";
import {
  CreateCoachRequest,
  CreateCoachRequestSchema,
  CreateSiteCoordinatorRequest,
  CreateSiteCoordinatorRequestSchema,
  CreateStudentRequest,
  CreateStudentRequestSchema,
} from "../schemas/index.js";
import { formatError, getLogger } from "../utils/logger.js";

export function userRouter(userService: UserService) {
  const logger = getLogger();
  return Router()
    .get(
      "/students",
      async (_req: Request, res: Response, next: NextFunction) => {
        try {
          const students = await userService.getAllStudents();
          res.status(200).json(students);
        } catch (err) {
          next(err);
        }
      },
    )
    .get(
      "student/:id",
      async (
        req: Request<{ id: string }, unknown>,
        res: Response,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        logger.debug(`Received GET request in /student`, req.params);
        try {
          const student = await userService.getStudent(id);
          logger.info(`Responding to client in /student/${id}`);
          res.status(200).json(student);
        } catch (err: any) {
          logger.error(
            `An error occured when trying to get /student ${formatError(err)}`,
          );
          next(err);
        }
      },
    )
    .get(
      "/coaches",
      async (_req: Request, res: Response, next: NextFunction) => {
        try {
          const coaches = await userService.getAllCoaches();
          res.status(200).json(coaches);
        } catch (err) {
          next(err);
        }
      },
    )
    .get(
      "/site-coordinators",
      async (_req: Request, res: Response, next: NextFunction) => {
        try {
          const siteCoordinators = await userService.getAllSiteCoordinators();
          res.status(200).json(siteCoordinators);
        } catch (err) {
          next(err);
        }
      },
    )
    .post(
      "/register/student",
      validateData(CreateStudentRequestSchema),
      async (
        req: Request<Record<string, never>, unknown, CreateStudentRequest>,
        res: Response,
        next: NextFunction,
      ) => {},
    )
    .post(
      "/register/coach",
      validateData(CreateCoachRequestSchema),
      async (
        req: Request<Record<string, never>, unknown, CreateCoachRequest>,
        res: Response,
        next: NextFunction,
      ) => {},
    )
    .post(
      "/register/site-coordinator",
      validateData(CreateSiteCoordinatorRequestSchema),
      async (
        req: Request<
          Record<string, never>,
          unknown,
          CreateSiteCoordinatorRequest
        >,
        res: Response,
        next: NextFunction,
      ) => {},
    );
}
