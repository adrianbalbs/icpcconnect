import { NextFunction, Request, Response, Router } from "express";
import {
  authorise,
  createAuthenticationMiddleware,
  validateData,
} from "../middleware/index.js";
import {
  CreateTeamRequest,
  CreateTeamRequestSchema,
  UpdateTeamRequest,
  UpdateTeamRequestSchema,
} from "../schemas/index.js";
import { AuthService, TeamService } from "../services/index.js";

export function teamRouter(teamService: TeamService, authService: AuthService) {
  const authenticate = createAuthenticationMiddleware(authService);
  return Router()
    .use(authenticate)
    .get(
      "/all",
      authorise(["Admin", "Coach", "Site Coordinator"]),
      async (_req: Request, res: Response, next: NextFunction) => {
        try {
          const teams = await teamService.getAllTeams();
          res.status(200).json(teams);
        } catch (err) {
          next(err);
        }
      },
    )
    .get(
      "/:id",
      authorise(["Admin", "Coach", "Site Coordinator", "Student"]),
      async (
        req: Request<{ id: string }, unknown>,
        res: Response,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        try {
          const team = await teamService.getTeam(id);
          res.status(200).json(team);
        } catch (err) {
          next(err);
        }
      },
    )
    .get(
      "/student/:id",
      authorise(["Admin", "Coach", "Site Coordinator", "Student"]),
      async (
        req: Request<{ id: string }, unknown>,
        res: Response,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        try {
          const team = await teamService.getTeamByStudent(id);
          res.status(200).json(team);
        } catch (err) {
          next(err);
        }
      },
    )
    .delete(
      "/:id",
      authorise(["Admin", "Coach"]),
      async (
        req: Request<{ id: string }, unknown>,
        res: Response,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        try {
          const result = await teamService.deleteTeam(id);
          res.status(200).json(result);
        } catch (err) {
          next(err);
        }
      },
    )
    .post(
      "/register",
      [
        authorise(["Admin", "Coach", "Student"]),
        validateData(CreateTeamRequestSchema, "body"),
      ],
      async (
        req: Request<Record<string, never>, unknown, CreateTeamRequest>,
        res: Response,
        next: NextFunction,
      ) => {
        const teamDetails = req.body;
        try {
          const result = await teamService.createTeam(teamDetails);
          res.status(200).json(result);
        } catch (err) {
          next(err);
        }
      },
    )
    .put(
      "/update/:id",
      [
        authorise(["Admin", "Coach"]),
        validateData(UpdateTeamRequestSchema, "body"),
      ],
      async (
        req: Request<{ id: string }, unknown, UpdateTeamRequest>,
        res: Response,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        const teamDetails = req.body;
        try {
          const team = teamService.updateTeam(id, teamDetails);
          res.status(200).json(team);
        } catch (err) {
          next(err);
        }
      },
    );
}
