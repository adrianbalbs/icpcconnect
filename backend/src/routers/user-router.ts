import { Request, Router } from "express";
import { createAuthenticationMiddleware } from "../middleware/authenticate.js";
import { authorise } from "../middleware/authorise.js";
import { AuthService, CodesService, UserService } from "../services/index.js";
import { handle } from "./handler.js";
import { validateData } from "../middleware/validator-middleware.js";
import {
  CreateContestRegistration,
  CreateContestRegistrationSchema,
  CreateUser,
  CreateUserSchema,
  GetAllUsersQuerySchema,
  UpdatePasswordSchema,
  UpdateStudentDetails,
  UpdateStudentDetailsSchema,
  UpdateUser,
  UpdateUserSchema,
  UserRole,
} from "../schemas/user-schema.js";

export function userRouter(
  userService: UserService,
  authService: AuthService,
  codesService: CodesService,
) {
  const authenticate = createAuthenticationMiddleware(authService);

  return Router()
    .post(
      "/",
      validateData(CreateUserSchema, "body"),
      handle(async (req: Request<unknown, unknown, CreateUser>, res) => {
        const { body } = req;
        const user = await userService.createUser(body, codesService);
        res.status(200).send(user);
      }),
    )
    .get(
      "/universities",
      handle(async (_req, res) => {
        const universities = await userService.getAllUniversities();
        res.status(200).send(universities);
      }),
    )
    .get(
      "/",
      [
        authenticate,
        authorise(["Admin", "Coach", "Site Coordinator"]),
        validateData(GetAllUsersQuerySchema, "query"),
      ],
      handle(
        async (
          req: Request<
            unknown,
            unknown,
            unknown,
            { role?: UserRole; contest?: string }
          >,
          res,
        ) => {
          const { role, contest } = req.query;
          const users = await userService.getAllUsers(role, contest);
          res.status(200).send(users);
        },
      ),
    )
    .get(
      "/:id",
      [
        authenticate,
        authorise(["Admin", "Coach", "Site Coordinator", "Student"]),
      ],
      handle(async (req: Request<{ id: string }, unknown>, res) => {
        const { id } = req.params;
        const user = await userService.getUserById(id);
        res.status(200).send(user);
      }),
    )
    .post(
      "/contest-registration",
      [
        authenticate,
        authorise(["Admin", "Coach", "Site Coordinator", "Student"]),
        validateData(CreateContestRegistrationSchema, "body"),
      ],
      handle(
        async (
          req: Request<unknown, unknown, CreateContestRegistration>,
          res,
        ) => {
          const { student, contest } = req.body;
          const result = await userService.registerForContest(student, contest);
          res.status(200).send(result);
        },
      ),
    )
    .get(
      "/:student/contest-registration/:contest",
      [
        authenticate,
        authorise(["Admin", "Coach", "Site Coordinator", "Student"]),
      ],
      handle(
        async (
          req: Request<{ student: string; contest: string }, unknown>,
          res,
        ) => {
          const { student, contest } = req.params;
          const result = await userService.getContestRegistrationDetails(
            student,
            contest,
          );
          res.status(200).send(result);
        },
      ),
    )
    .delete(
      "/:student/contest-registration/:contest",
      [
        authenticate,
        authorise(["Admin", "Coach", "Site Coordinator", "Student"]),
      ],
      handle(
        async (
          req: Request<{ student: string; contest: string }, unknown>,
          res,
        ) => {
          const { student, contest } = req.params;
          const result = await userService.deleteContestRegistration(
            student,
            contest,
          );
          res.status(200).send(result);
        },
      ),
    )
    .patch(
      "/:id",
      [
        authenticate,
        authorise(["Admin", "Coach", "Site Coordinator"]),
        validateData(UpdateUserSchema, "body"),
      ],
      handle(async (req: Request<{ id: string }, unknown, UpdateUser>, res) => {
        const { id } = req.params;
        const { body } = req;
        const result = await userService.updateUser(id, body);
        res.status(200).send(result);
      }),
    )
    .patch(
      "/:id/student-details",
      [
        authenticate,
        authorise(["Admin", "Coach", "Site Coordinator", "Student"]),
        validateData(UpdateStudentDetailsSchema, "body"),
      ],
      handle(
        async (
          req: Request<{ id: string }, unknown, UpdateStudentDetails>,
          res,
        ) => {
          const { id } = req.params;
          const { body } = req;
          const result = await userService.updateStudentDetails(id, body);
          res.status(200).send(result);
        },
      ),
    )
    .get(
      "/:id/student-details/preferences",
      [authenticate, authorise(["Admin", "Student"])],
      handle(async (req: Request<{ id: string }, unknown>, res) => {
        const { id } = req.params;
        const result = await userService.getStudentPreferences(id);
        res.status(200).send(result);
      }),
    )
    .get(
      "/:id/student-details/exclusions",
      [authenticate, authorise(["Admin", "Student"])],
      handle(async (req: Request<{ id: string }, unknown>, res) => {
        const { id } = req.params;
        const result = await userService.getStudentExclusions(id);
        res.status(200).send(result);
      }),
    )
    .put(
      "/:id/password",
      [
        authenticate,
        authorise(["Admin", "Coach", "Site Coordinator", "Student"]),
        validateData(UpdatePasswordSchema, "body"),
      ],
      handle(
        async (
          req: Request<
            { id: string },
            unknown,
            { oldPassword: string; newPassword: string }
          >,
          res,
        ) => {
          const { id } = req.params;
          const {
            body: { oldPassword, newPassword },
          } = req;
          const result = await userService.updatePassword(
            id,
            oldPassword,
            newPassword,
          );
          res.status(200).send(result);
        },
      ),
    )
    .delete(
      "/:id",
      [authenticate, authorise(["Admin", "Coach"])],
      handle(async (req: Request<{ id: string }, unknown>, res) => {
        const { id } = req.params;
        const user = await userService.deleteUser(id);
        res.status(200).send(user);
      }),
    );
}
