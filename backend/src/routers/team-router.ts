import { NextFunction, Request, Response, Router } from "express";
import {
  authorise,
  createAuthenticationMiddleware,
  validateData,
} from "../middleware/index.js";
import {
  CreateTeamRequest,
  CreateTeamRequestSchema,
  GetAllTeamsQuery,
  GetAllTeamsQuerySchema,
  UpdateTeamRequest,
  UpdateTeamRequestSchema,
  ReplacementRequest,
  ReplacementRequestSchema,
  PulloutRequest,
  PulloutRequestSchema,
  UpdateTeamRequestSID,
} from "../schemas/index.js";
import { AuthService, TeamService } from "../services/index.js";

export function teamRouter(teamService: TeamService, authService: AuthService) {
  const authenticate = createAuthenticationMiddleware(authService);
  return Router()
    .use(authenticate)
    .get(
      "/all",
      [
        authorise(["Admin", "Coach", "Site Coordinator"]),
        validateData(GetAllTeamsQuerySchema, "query"),
      ],
      async (
        req: Request<unknown, unknown, unknown, GetAllTeamsQuery>,
        res: Response,
        next: NextFunction,
      ) => {
        try {
          const { contest } = req.query;
          const teams = await teamService.getAllTeams(contest);
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
      "/student/:studentId/contest/:contestId",
      authorise(["Admin", "Coach", "Site Coordinator", "Student"]),
      async (
        req: Request<{ studentId: string; contestId: string }, unknown>,
        res: Response,
        next: NextFunction,
      ) => {
        const { studentId, contestId } = req.params;
        try {
          const team = await teamService.getTeamByStudentAndContest(
            studentId,
            contestId,
          );
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
    )
    .post(
      "/createPullout/:studentId",
      [
        authorise(["Student", "Admin"]),
        validateData(PulloutRequestSchema, "body"),
      ],
      async (
        req: Request<{ studentId: string }, unknown, PulloutRequest>,
        res: Response,
        next: NextFunction,
      ) => {
        //studentId is the *internal* id of the student pulling out (so that no student can pull out another)
        //replacementId is the *student* id of the replacing student, such that only if they know the student closely
        //that they can choose them as a replacmeent
        const { studentId } = req.params;

        try {
          const team = teamService.createPulloutReq(studentId, req.body);
          res.status(200).json(team);
        } catch (err) {
          next(err);
        }
      },
    )
    .put(
      "/handlePullout/:studentId",
      [authenticate, authorise(["Admin", "Coach"])],
      async (
        req: Request<{ studentId: string }, unknown, { accepting: boolean }>,
        res: Response,
        next: NextFunction,
      ) => {
        //The *internal* id of the student we wish to remove from the team
        const { studentId } = req.params;
        const {
          body: { accepting },
        } = req;

        try {
          const result = await teamService.handlePulloutReq(
            studentId,
            accepting,
          );
          res.status(200).send(result);
        } catch (err) {
          next(err);
        }
      },
    )
    .put(
      "/handleReplacement",
      [
        authenticate,
        authorise(["Admin", "Coach"]),
        validateData(ReplacementRequestSchema, "body"),
      ],
      async (
        req: Request<{ studentId: string }, unknown, ReplacementRequest>,
        res: Response,
        next: NextFunction,
      ) => {
        try {
          const result = await teamService.handleReplacement(req.body);
          res.status(200).send(result);
        } catch (err) {
          next(err);
        }
      },
    )
    .delete(
      "/deletePullout/:userId",
      [authenticate, authorise(["Student", "Admin"])],
      async (
        req: Request<{ userId: string }, unknown>,
        res: Response,
        next: NextFunction,
      ) => {
        //The *internal* id of the student whose pullout we wish to delete
        const { userId } = req.params;

        try {
          const result = await teamService.deletePulloutReq(userId);
          res.status(200).send(result);
        } catch (err) {
          next(err);
        }
      },
    )
    .put(
      "/update/sids/:id",
      [
        authorise(["Admin", "Coach"]),
        validateData(UpdateTeamRequestSchema, "body"),
      ],
      async (
        req: Request<{ id: string }, unknown, UpdateTeamRequestSID>,
        res: Response,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        const teamDetails = req.body;
        try {
          const team = teamService.updateTeamSID(id, teamDetails);
          res.status(200).json(team);
        } catch (err) {
          next(err);
        }
      },
    );
}
