import { Request, Router } from "express";
import { createAuthenticationMiddleware } from "../middleware/authenticate.js";
import { authorise } from "../middleware/authorise.js";
import { AuthService, UserService } from "../services/index.js";
import { handle } from "./handler.js";
import { validateData } from "../middleware/validator-middleware.js";
import {
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
import { PutStudentTeamSchema } from "src/schemas/team-schema.js";

export function userRouter(userService: UserService, authService: AuthService) {
  const authenticate = createAuthenticationMiddleware(authService);

  return Router()
    .post(
      "/",
      validateData(CreateUserSchema, "body"),
      handle(async (req: Request<unknown, unknown, CreateUser>, res) => {
        const { body } = req;
        const user = await userService.createUser(body);
        res.status(200).send(user);
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
          req: Request<unknown, unknown, unknown, { role?: UserRole }>,
          res,
        ) => {
          const { role } = req.query;
          const users = await userService.getAllUsers(role);
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
    .patch(
      "/:id",
      [
        authenticate,
        authorise(["Admin", "Coach", "Student"]),
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
        authorise(["Admin", "Coach", "Student"]),
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
      [
        authenticate,
        authorise(["Admin", "Student"]),
        validateData(PutStudentTeamSchema, "body"),
      ],
      handle(
        async (
          req: Request<{ id: string }, unknown>,
          res,
        ) => {
          const { id } = req.params;
          const result = await userService.getStudentPreferences(id);
          res.status(200).send(result);
        },
      ),
    )
    .get(
      "/:id/student-details/exclusions",
      [
        authenticate,
        authorise(["Admin", "Student"]),
        validateData(PutStudentTeamSchema, "body"),
      ],
      handle(
        async (
          req: Request<{ id: string }, unknown>,
          res,
        ) => {
          const { id } = req.params;
          const result = await userService.getStudentExclusions(id);
          res.status(200).send(result);
        },
      ),
    )
    .put(
      "/:id/password",
      [
        authenticate,
        authorise(["Admin", "Coach", "Student"]),
        validateData(UpdatePasswordSchema, "body"),
      ],
      handle(
        async (
          req: Request<{ id: string }, unknown, { password: string }>,
          res,
        ) => {
          const { id } = req.params;
          const {
            body: { password },
          } = req;
          const result = await userService.updatePassword(id, password);
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
