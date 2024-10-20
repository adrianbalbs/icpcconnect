import { NextFunction, Request, Response, Router } from "express";
import {
  createAuthenticationMiddleware,
  createAuthoriseMiddleware,
  validateData,
} from "../middleware/index.js";
import {
  CreateStudentRequest,
  CreateStudentRequestSchema,
  UpdateStudentExclusionsRequest,
  UpdateStudentExclusionsRequestSchema,
  UpdateStudentRequest,
  UpdateStudentRequestSchema,
} from "../schemas/index.js";
import { AuthService, StudentService } from "../services/index.js";

export function studentRouter(
  studentService: StudentService,
  authService: AuthService,
) {
  const authenticate = createAuthenticationMiddleware(authService);
  const authorise = createAuthoriseMiddleware(authService);
  return Router()
    .get(
      "/",
      [authenticate, authorise(["admin", "coach", "site_coordinator"])],
      async (_req: Request, res: Response, next: NextFunction) => {
        try {
          const students = await studentService.getAllStudents();
          res.status(200).json(students);
        } catch (err) {
          next(err);
        }
      },
    )
    .get(
      "/:id",
      [
        authenticate,
        authorise(["admin", "student", "coach", "site_coordinator"]),
      ],
      async (
        req: Request<{ id: string }, unknown>,
        res: Response,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        try {
          const student = await studentService.getStudentById(id);
          res.status(200).json(student);
        } catch (err) {
          next(err);
        }
      },
    )
    .get(
      "/exclusions/:id",
      async (
        req: Request<{ id: string }, unknown>,
        res: Response,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        try {
          const exclusions = await studentService.getStudentExclusions(id);
          res.status(200).json(exclusions);
        } catch (err) {
          next(err);
        }
      },
    )
    .delete(
      "/:id",
      [authenticate, authorise(["admin", "student", "coach"])],
      async (
        req: Request<{ id: string }, unknown>,
        res: Response,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        try {
          const student = await studentService.deleteStudent(id);
          res.status(200).json(student);
        } catch (err) {
          next(err);
        }
      },
    )
    .post(
      "/",
      validateData(CreateStudentRequestSchema, "body"),
      async (
        req: Request<Record<string, never>, unknown, CreateStudentRequest>,
        res: Response,
        next: NextFunction,
      ) => {
        const studentDetails = req.body;
        try {
          const result = await studentService.createStudent(studentDetails);
          res.status(200).json(result);
        } catch (err) {
          next(err);
        }
      },
    )
    .put(
      "/exclusions/:id",
      [authenticate, authorise(["admin", "student", "coach"])],
      validateData(UpdateStudentExclusionsRequestSchema, "body"),
      async (
        req: Request<{ id: string }, unknown, UpdateStudentExclusionsRequest>,
        res: Response,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        const { exclusions } = req.body;
        try {
          const result = await studentService.updateStudentExclusions(
            id,
            exclusions,
          );
          res.status(200).json(result);
        } catch (err) {
          next(err);
        }
      },
    )
    .put(
      "/:id",
      [authenticate, authorise(["admin", "student", "coach"])],
      validateData(UpdateStudentRequestSchema, "body"),
      async (
        req: Request<{ id: string }, unknown, UpdateStudentRequest>,
        res: Response,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        const updatedDetails = req.body;
        try {
          const result = await studentService.updateStudent(id, updatedDetails);
          res.status(200).json(result);
        } catch (err) {
          next(err);
        }
      },
    );
}
