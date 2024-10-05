import { NextFunction, Request, Response, Router } from "express";
import { validateData } from "../middleware/index.js";
import {
  CreateStudentRequest,
  CreateStudentRequestSchema,
  UpdateStudentRequest,
  UpdateStudentRequestSchema,
} from "../schemas/index.js";
import { getLogger } from "../utils/logger.js";
import { StudentService } from "../services/index.js";

export function studentRouter(studentService: StudentService) {
  const logger = getLogger();
  return Router()
    .get("/all", async (_req: Request, res: Response, next: NextFunction) => {
      try {
        const students = await studentService.getAllStudents();
        res.status(200).json(students);
      } catch (err) {
        next(err);
      }
    })
    .get(
      "/sid/:studentId",
      async (
        req: Request<{ studentId: string }, unknown>,
        res: Response,
        next: NextFunction,
      ) => {
        const { studentId } = req.params;
        try {
          const student = await studentService.getStudentByStudentId(studentId);
          res.status(200).json(student);
        } catch (err: any) {
          next(err);
        }
      },
    )
    .get(
      "/:id",
      async (
        req: Request<{ id: string }, unknown>,
        res: Response,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        try {
          const student = await studentService.getStudentById(id);
          logger.info(student);
          res.status(200).json(student);
        } catch (err: any) {
          next(err);
        }
      },
    )
    .post(
      "/register",
      validateData(CreateStudentRequestSchema),
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
      "/update/:id",
      validateData(UpdateStudentRequestSchema),
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
