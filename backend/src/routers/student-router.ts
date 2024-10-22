import { NextFunction, Request, Response, Router } from "express";
import { validateData } from "../middleware/index.js";
import {
  CreateStudentRequest,
  CreateStudentRequestSchema,
  UpdateStudentRequest,
  UpdateStudentRequestSchema,
} from "../schemas/index.js";
import { StudentService } from "../services/index.js";

export function studentRouter(studentService: StudentService) {
  return Router()
    .get(
      "/students",
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
      "/students/:id",
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
      "/students/:id/teamEmails",
      async (
        req: Request<{ id: string }, unknown>,
        res: Response,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        try {
          const emails = await studentService.getTeamEmails(id);
          res.status(200).json(emails);
        } catch (err) {
          next(err);
        }
      },
    )
    .delete(
      "/students/:id",
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
      "/students",
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
      "/students/:id",
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
