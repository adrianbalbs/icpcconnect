import { and, eq, inArray } from "drizzle-orm";
import {
  DatabaseConnection,
  teams,
  studentDetails,
  replacements,
  users,
  universities,
  contests,
} from "../db/index.js";
import { UserService } from "./index.js";
import {
  ReplacementRequest,
  CreateTeamRequest,
  TeamDTO,
  PulloutRequest,
  UpdateTeamRequest,
  CreateTeamResponse,
  UpdateTeamResponse,
  UpdateTeamRequestSID,
  UpdateTeamResponseSID,
} from "../schemas/index.js";
import { badRequest, HTTPError, notFoundError } from "../utils/errors.js";
import { DeleteResponse } from "../types/api-res.js";

export class TeamService {
  private readonly db: DatabaseConnection;
  private readonly userService: UserService;

  constructor(db: DatabaseConnection, userService: UserService) {
    this.db = db;
    this.userService = userService;
  }

  /*
   * Create a team of students
   *
   * @param req - CreateTeamRequest
   *   req.name - name of team
   *   req.university - University-id that team is associated with
   *   req.memberIds - Array of user-ids corresponding to the team-members
   *   req.flagged - Team is flagged for potential student conflicts
   *
   * @returns CreateTeamResponse
   *   CreateTeamResponse.teamId - Id of team created
   *
   */
  async createTeam(req: CreateTeamRequest): Promise<CreateTeamResponse> {
    const { name, university, memberIds, contest, flagged } = req;

    const [id] = await this.db
      .insert(teams)
      .values({
        name,
        university,
        contest,
        flagged,
      })
      .returning({ teamId: teams.id });
    const members = await this.db.query.users.findMany({
      where: and(inArray(users.id, memberIds), eq(users.role, "Student")),
    });

    for (const member of members) {
      await this.db
        .update(studentDetails)
        .set({ team: id.teamId })
        .where(eq(studentDetails.userId, member.id));
    }

    return id;
  }

  /*
   * Get the details of a team, given it's id
   *
   * @param teamId - id of team specified
   *
   * @returns TeamDTO
   *   TeamDTO.id   - internal id of team
   *   TeamDTO.name - name of team
   *   TeamDTO.university - university team is associated with
   *   TeamDTO.contest - contest team is signed up for
   *   TeamDTO.flagged - flagged for potential violation of exclusion-prefs
   *   TeamDTO.members - array of members in team
   *
   * @throws BadRequest
   *   - If team-id doesn't correspond to a team
   */
  async getTeam(teamId: string): Promise<TeamDTO> {
    const [team] = await this.db
      .select({
        id: teams.id,
        name: teams.name,
        university: universities.name,
        contest: contests.name,
        flagged: teams.flagged,
      })
      .from(teams)
      .innerJoin(universities, eq(universities.id, teams.university))
      .innerJoin(contests, eq(contests.id, teams.contest))
      .where(eq(teams.id, teamId));

    if (!team) {
      throw new HTTPError({
        errorCode: notFoundError.errorCode,
        message: `Could not find team with id: ${teamId}`,
      });
    }

    const members = await this.db
      .select({
        id: users.id,
        givenName: users.givenName,
        familyName: users.familyName,
        studentId: studentDetails.studentId,
        email: users.email,
      })
      .from(studentDetails)
      .innerJoin(users, eq(users.id, studentDetails.userId))
      .where(eq(studentDetails.team, teamId));

    const replacement_arr = await this.db
      .select({
        leavingUserId: replacements.leavingInternalId,
        replacementStudentId: replacements.replacementStudentId,
        reason: replacements.reason,
      })
      .from(replacements)
      .where(eq(replacements.associated_team, team.id));

    return { ...team, members, replacements: replacement_arr };
  }

  /*
   * Get the details of a team, given it's id
   *
   * @param studentId - user-id of specified student
   * @param contestId - contest-id of specified contest
   *
   * @returns TeamDTO
   *   TeamDTO.id   - internal id of team
   *   TeamDTO.name - name of team
   *   TeamDTO.university - university team is associated with
   *   TeamDTO.contest - contest team is signed up for
   *   TeamDTO.flagged - flagged for potential violation of exclusion-prefs
   *   TeamDTO.members - array of members in team
   *
   * @throws BadRequest
   *   - If user-id+contest-id doesn't match a given team
   */
  async getTeamByStudentAndContest(
    studentId: string,
    contestId: string,
  ): Promise<TeamDTO> {
    const [team] = await this.db
      .select({
        id: teams.id,
        name: teams.name,
        university: universities.name,
        contest: contests.name,
        flagged: teams.flagged,
      })
      .from(studentDetails)
      .where(
        and(eq(studentDetails.userId, studentId), eq(contests.id, contestId)),
      )
      .innerJoin(teams, eq(teams.id, studentDetails.team))
      .innerJoin(contests, eq(contests.id, teams.contest))
      .innerJoin(universities, eq(universities.id, teams.university));

    if (!team) {
      throw new HTTPError({
        errorCode: notFoundError.errorCode,
        message: `Could not find team associated with student: ${studentId}`,
      });
    }

    const members = await this.db
      .select({
        id: users.id,
        givenName: users.givenName,
        familyName: users.familyName,
        studentId: studentDetails.studentId,
        email: users.email,
      })
      .from(studentDetails)
      .where(eq(studentDetails.team, team.id))
      .innerJoin(users, eq(users.id, studentDetails.userId));

    const replacement_arr = await this.db
      .select({
        leavingUserId: replacements.leavingInternalId,
        replacementStudentId: replacements.replacementStudentId,
        reason: replacements.reason,
      })
      .from(replacements)
      .where(eq(replacements.associated_team, team.id));

    return { ...team, members, replacements: replacement_arr };
  }

  /*
   * Get the details of all teams
   *
   * @param contest - Optional, gets all teams for a given contest
   *
   * @returns TeamDTO[]
   *   TeamDTO.id   - internal id of team
   *   TeamDTO.name - name of team
   *   TeamDTO.university - university team is associated with
   *   TeamDTO.contest - contest team is signed up for
   *   TeamDTO.flagged - flagged for potential violation of exclusion-prefs
   *   TeamDTO.members - array of members in team
   *
   */
  async getAllTeams(contest?: string): Promise<{ allTeams: TeamDTO[] }> {
    const query = this.db
      .select({
        id: teams.id,
        name: teams.name,
        university: universities.name,
        contest: contests.name,
        flagged: teams.flagged,
      })
      .from(teams)
      .innerJoin(universities, eq(universities.id, teams.university))
      .innerJoin(contests, eq(contests.id, teams.contest))
      .$dynamic();

    if (contest) {
      query.where(eq(contests.id, contest));
    }

    const rawTeams = await query;
    const allTeams = await Promise.all(
      rawTeams.map(async (team) => {
        const members = await this.db
          .select({
            id: users.id,
            givenName: users.givenName,
            familyName: users.familyName,
            studentId: studentDetails.studentId,
            email: users.email,
          })
          .from(studentDetails)
          .innerJoin(users, eq(users.id, studentDetails.userId))
          .where(eq(studentDetails.team, team.id));

        const replacement_arr = await this.db
          .select({
            leavingUserId: replacements.leavingInternalId,
            replacementStudentId: replacements.replacementStudentId,
            reason: replacements.reason,
          })
          .from(replacements)
          .where(eq(replacements.associated_team, team.id));

        return { ...team, members, replacements: replacement_arr };
      }),
    );
    return { allTeams };
  }

  /*
   * Update the details of a given team
   *
   * @remarks
   * Expects all team-members to be sent
   * And unsets 'old' team-members
   *
   * @param teamId - Id of associated team
   * @param updatedDetails - UpdateTeamRequest
   *   updatedDetails.name       - name of the team
   *   updatedDetails.university - university-id
   *   updatedDetails.contest   - Contest team is associated with
   *   updatedDetails.flagged   - Whether team is flagged for potential violations of exclusion-prefs
   *   updatedDetails.memberIds - User-ids of the members
   *
   * @returns UpdateTeamResponse
   *
   *
   */
  async updateTeam(
    teamId: string,
    updatedDetails: UpdateTeamRequest,
  ): Promise<UpdateTeamResponse> {
    const { memberIds, ...rest } = updatedDetails;

    const cleanedTeamUpdates = Object.fromEntries(
      Object.entries(rest).filter(([, value]) => value !== undefined),
    );

    const result = await this.db.transaction(async (tx) => {
      if (memberIds) {
        //Unset old team-members
        {
          const members = await tx.query.studentDetails.findMany({
            where: eq(studentDetails.team, teamId),
          });

          for (const member of members) {
            await tx
              .update(studentDetails)
              .set({ team: null })
              .where(eq(studentDetails.userId, member.userId));
          }
        }

        //Set team-id for new members
        const members = await tx.query.users.findMany({
          where: inArray(users.id, memberIds),
        });

        for (const member of members) {
          await tx
            .update(studentDetails)
            .set({ team: teamId })
            .where(eq(studentDetails.userId, member.id));
        }
      }

      if (Object.keys(cleanedTeamUpdates).length > 0) {
        await tx
          .update(teams)
          .set(cleanedTeamUpdates)
          .where(eq(teams.id, teamId));
      }

      return { ...rest, memberIds };
    });

    return result;
  }

  /*
   * Update the details of a given team
   *
   * @remarks
   * Same as 'updateTeam' but uses studentIds
   *
   * @param teamId - Id of associated team
   * @param updatedDetailsSID - UpdateTeamRequest
   *   updatedDetails.name       - name of the team
   *   updatedDetails.university - university-id
   *   updatedDetails.contest   - Contest team is associated with
   *   updatedDetails.flagged   - Whether team is flagged for potential violations of exclusion-prefs
   *   updatedDetails.memberIds - student-ids of the members
   *
   * @returns UpdateTeamResponse
   *
   *
   */
  async updateTeamSID(
    teamId: string,
    updatedDetails: UpdateTeamRequestSID,
  ): Promise<UpdateTeamResponseSID> {
    const { memberIds, ...rest } = updatedDetails;

    const cleanedTeamUpdates = Object.fromEntries(
      Object.entries(rest).filter(([, value]) => value !== undefined),
    );

    const result = await this.db.transaction(async (tx) => {
      if (memberIds) {
        //Unset old team-members
        {
          const members = await tx.query.studentDetails.findMany({
            where: eq(studentDetails.team, teamId),
          });

          for (const member of members) {
            await tx
              .update(studentDetails)
              .set({ team: null })
              .where(eq(studentDetails.studentId, member.studentId));
          }
        }

        //Set team-id for new members
        const members = await tx.query.studentDetails.findMany({
          where: inArray(studentDetails.studentId, memberIds),
        });

        for (const member of members) {
          await tx
            .update(studentDetails)
            .set({ team: teamId })
            .where(eq(studentDetails.studentId, member.studentId));
        }
      }

      if (Object.keys(cleanedTeamUpdates).length > 0) {
        await tx
          .update(teams)
          .set(cleanedTeamUpdates)
          .where(eq(teams.id, teamId));
      }

      return { ...rest, memberIds };
    });

    return result;
  }

  /*
   * Deletes a given team
   *
   * @param teamId - id of the specified team
   *
   * @throws BadRequest
   *   - If team-id doesn't  correspond to a valid team
   */
  async deleteTeam(teamId: string): Promise<DeleteResponse> {
    const [team] = await this.db
      .select({ teamId: teams.id })
      .from(teams)
      .where(eq(teams.id, teamId));

    if (!team) {
      throw new HTTPError({
        errorCode: badRequest.errorCode,
        message: `Team with id: ${teamId} does not exist`,
      });
    }
    await this.db.transaction(async (tx) => {
      await tx
        .update(studentDetails)
        .set({ team: null })
        .where(eq(studentDetails.team, teamId));
      await tx.delete(teams).where(eq(teams.id, teamId));
    });

    return { status: "OK" };
  }

  async createPulloutReq(studentId: string, pulloutReq: PulloutRequest) {
    const { replacedWith, reason } = pulloutReq;

    const [team] = await this.db
      .select({
        id: teams.id,
        name: teams.name,
      })
      .from(studentDetails)
      .where(eq(studentDetails.userId, studentId))
      .leftJoin(teams, eq(teams.id, studentDetails.team));

    if (team === undefined || team.id === null) {
      throw new HTTPError(badRequest);
    }

    //Seing if we already have a replacement proposed
    const replacement = await this.db
      .select({})
      .from(replacements)
      .where(eq(replacements.leavingInternalId, studentId));

    //Don't have an existing replacement proposed
    if (replacement.length === 0) {
      await this.db.insert(replacements).values({
        associated_team: team.id,
        leavingInternalId: studentId,
        replacementStudentId: replacedWith,
        reason: reason,
      });
    } else {
      //Overwrite our existing replacement
      await this.db
        .update(replacements)
        .set({
          associated_team: team.id,
          replacementStudentId: replacedWith,
          reason: reason,
        })
        .where(eq(replacements.leavingInternalId, studentId));
    }

    return { status: "OK" };
  }

  //Handle replacement request
  async handlePulloutReq(studentId: string, accepting: boolean) {
    const [replacement] = await this.db
      .select({
        team_id: replacements.associated_team,
        leaving: replacements.leavingInternalId,
        replacing: replacements.replacementStudentId,
      })
      .from(replacements)
      .where(eq(replacements.leavingInternalId, studentId));

    if (replacement === undefined || replacement.team_id === null) {
      throw new HTTPError(badRequest);
    }

    if (accepting) {
      //Set students team to null
      await this.userService.updateStudentDetails(studentId, { team: null });

      //If a replacement is proposed
      //I believe if not its an empty string
      if (
        replacement.replacing !== undefined &&
        replacement.replacing.length !== 0
      ) {
        //Set replacements team to the current team
        const [replacementInternalId] = await this.db
          .select({
            id: studentDetails.userId,
          })
          .from(studentDetails)
          .where(eq(studentDetails.studentId, replacement.replacing));

        await this.userService.updateStudentDetails(replacementInternalId.id, {
          team: replacement.team_id,
        });
      }
    }

    //Delete replacement request from db
    await this.db
      .delete(replacements)
      .where(eq(replacements.leavingInternalId, studentId));

    return { status: "OK" };
  }

  async deletePulloutReq(userId: string): Promise<DeleteResponse> {
    await this.db
      .delete(replacements)
      .where(eq(replacements.leavingInternalId, userId));
    return { status: "OK" };
  }

  async handleReplacement(replacementReq: ReplacementRequest) {
    const studentInternalId = replacementReq.student;
    const teamId = replacementReq.team;
    const replacingStudentId = replacementReq.replacedWith;

    //Info about student replacing
    const [replacingInfo] = await this.db
      .select({
        team: teams.id,
        internalId: users.id,
      })
      .from(users)
      .innerJoin(studentDetails, eq(studentDetails.userId, users.id))
      .leftJoin(teams, eq(teams.id, studentDetails.team))
      .where(eq(studentDetails.studentId, replacingStudentId));

    //Info about student being replaced
    const [replacedInfo] = await this.db
      .select({
        studentId: studentDetails.studentId,
      })
      .from(users)
      .innerJoin(studentDetails, eq(studentDetails.userId, users.id))
      .leftJoin(teams, eq(teams.id, studentDetails.team))
      .where(eq(studentDetails.studentId, replacingStudentId));

    await this.userService.updateStudentDetails(studentInternalId, {
      team: replacingInfo.team,
    });
    await this.userService.updateStudentDetails(replacingInfo.internalId, {
      team: teamId,
    });

    return {
      allocDetails: [
        {
          sId: replacingStudentId,
          team: teamId,
        },
        {
          sId: replacedInfo.studentId,
          team: replacingInfo.team,
        },
      ],
    };
  }
}
