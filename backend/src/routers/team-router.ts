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
      authorise(["admin"]),
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
      "/uni/:id",
      authorise(["coach", "site_coordinator", "admin"]),
      async (
        req: Request<{ id: string }, unknown>,
        res: Response,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        try {
          const teams = await teamService.getTeamsFromUni(Number(id));
          res.status(200).json(teams);
        } catch (err) {
          next(err);
        }
      },
    )
    .get(
      "/site/:id",
      authorise(["site_coordinator", "admin"]),
      async (
        req: Request<{ id: string }, unknown>,
        res: Response,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        try {
          const teams = await teamService.getTeamsFromSite(Number(id));
          res.status(200).json(teams);
        } catch (err) {
          next(err);
        }
      },
    )
    .get(
      "/:id",
      authorise(["admin", "coach", "site_coordinator", "student"]),
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
      authorise(["admin", "coach", "site_coordinator", "student"]),
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
      authorise(["admin", "coach"]),
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
        authorise(["admin", "coach", "student"]),
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
        authorise(["admin", "coach"]),
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
