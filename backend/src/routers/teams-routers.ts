import { NextFunction, Request, Response, Router } from "express";
import { validateData } from "../middleware/index.js";
import {
  CreateTeamRequest,
  CreateTeamSchema,
  UpdateTeamRequest,
  UpdateTeamSchema,
} from "../schemas/index.js";
import { TeamsService } from "../services/teams-service.js";

export function studentRouter(teamsService: TeamsService) {
  return Router()
    .get(
      "/teams",
      async (_req: Request, res: Response, next: NextFunction) => {
        try {
          const teams = await teamsService.getAllTeams();
          res.status(200).json(teams);
        } catch (err) {
          next(err);
        }
      },
    )
    .get(
      "/teams/uni/:id",
      async (
        req: Request<{ id: string }, unknown>,
        res: Response,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        try {
          const teams = await teamsService.getTeamsFromUni(id);
          res.status(200).json(teams);
        } catch (err) {
          next(err);
        }
      },
    )
    .get(
        "/teams/site/:id",
        async (
          req: Request<{ id: string }, unknown>,
          res: Response,
          next: NextFunction,
        ) => {
          const { id } = req.params;
          try {
            const teams = await teamsService.getTeamsFromSite(id);
            res.status(200).json(teams);
          } catch (err) {
            next(err);
          }
        },
      )
    .post(
      "/teams",
      validateData(CreateTeamSchema, "body"),
      async (
        req: Request<Record<string, never>, unknown, CreateTeamRequest>,
        res: Response,
        next: NextFunction,
      ) => {
        const teamDetails = req.body;
        try {
          const result = await teamsService.createTeam(teamDetails);
          res.status(200).json(result);
        } catch (err) {
          next(err);
        }
      },
    )
    .put(
      "/teams/:id",
      validateData(UpdateTeamSchema, "body"),
      async (
        req: Request<{ id: string }, unknown, UpdateTeamRequest>,
        res: Response,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        const updatedDetails = req.body;
        try {
          const result = await teamsService.updateTeam(id, updatedDetails);
          res.status(200).json(result);
        } catch (err) {
          next(err);
        }
      },
    );
}
