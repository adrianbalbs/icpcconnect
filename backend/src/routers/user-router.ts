import { Request, Router } from "express";
import { createAuthenticationMiddleware } from "src/middleware/authenticate.js";
import { authorise } from "src/middleware/authorise.js";
import { AuthService, UserService } from "src/services/index.js";
import { handle } from "./handler.js";
import { validateData } from "src/middleware/validator-middleware.js";
import {
  BaseUserWithStudentDetails,
  BaseUserWithStudentDetailsSchema,
  UpdatePassword,
  UpdatePasswordSchema,
  UpdateStudentDetails,
  UpdateStudentDetailsSchema,
  UpdateUser,
  UpdateUserSchema,
} from "src/schemas/user-schema.js";

export function userRouter(userService: UserService, authService: AuthService) {
  const authenticate = createAuthenticationMiddleware(authService);

  return Router()
    .post(
      "/",
      validateData(BaseUserWithStudentDetailsSchema, "body"),
      handle(
        async (
          req: Request<unknown, unknown, BaseUserWithStudentDetails>,
          res,
        ) => {
          const { body } = req;
          const user = await userService.createUser(body);
          res.status(200).send(user);
        },
      ),
    )
    .get(
      "/",
      [authenticate, authorise(["Admin", "Coach", "Site Coordinator"])],
      handle(async (_req, res) => {
        const users = await userService.getAllUsers();
        res.status(200).send(users);
      }),
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
    .get(
      "/:id/student-details",
      [
        authenticate,
        authorise(["Admin", "Coach", "Site Coordinator", "Student"]),
      ],
      handle(async (req: Request<{ id: string }, unknown>, res) => {
        const { id } = req.params;
        const user = await userService.getUserStudentDetails(id);
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
    .put(
      "/:id/password",
      [
        authenticate,
        authorise(["Admin", "Coach", "Student"]),
        validateData(UpdatePasswordSchema, "body"),
      ],
      handle(
        async (req: Request<{ id: string }, unknown, UpdatePassword>, res) => {
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
        const result = await userService.deleteUser(id);
        res.status(200).send(result);
      }),
    );
}
