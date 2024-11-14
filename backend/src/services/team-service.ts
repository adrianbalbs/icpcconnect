import { and, eq, inArray } from "drizzle-orm";
import {
  DatabaseConnection,
  teams,
  studentDetails,
  replacements,
  users,
} from "../db/index.js";
import { ReplacementRequest, CreateTeamRequest, UpdateTeamRequest, PulloutRequest } from "../schemas/index.js";
import { badRequest, HTTPError } from "../utils/errors.js";
import { UserService} from "./index.js"

export class TeamService {
  private readonly db: DatabaseConnection;
  private readonly userService : UserService;

  constructor(db: DatabaseConnection, userService: UserService) {
    this.db = db;
    this.userService = userService;
  }

  async createTeam(req: CreateTeamRequest) {
    const { name, university, memberIds } = req;

    const [id] = await this.db
      .insert(teams)
      .values({
        name,
        university,
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

  async getTeam(teamId: string) {
    const team = await this.db.query.teams.findFirst({
      where: eq(teams.id, teamId),
      columns: { university: false },
      with: { members: true, university: true, replacements: true},
    });

    if (team === undefined) {
      throw new HTTPError(badRequest);
    }

    return team;
  }

  async getTeamByStudent(studentId: string) {
    const [team] = await this.db
      .select({
        id: teams.id,
        name: teams.name,
      })
      .from(studentDetails)
      .where(eq(studentDetails.userId, studentId))
      .leftJoin(teams, eq(teams.id, studentDetails.team));

    if (team == undefined || team.id === null) {
      throw new HTTPError(badRequest);
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
      .where(eq(studentDetails.team, String(team.id)))
      .innerJoin(users, eq(users.id, studentDetails.userId));

    const replacement_arr = await this.db
      .select({
          associated_team: replacements.associated_team,
          leavingInternalId: replacements.leavingInternalId,
          replacingStudentId: replacements.replacementStudentId,
      })
      .from(replacements)
      .where(eq(replacements.associated_team, team.id));

    return { ...team, members, replacements: replacement_arr};
  }

  async getAllTeams() {
    return await this.db.query.teams.findMany({
      columns: { university: false },
      with: { members: true, university: true, replacements: true },
    });
  }

  //Expects all team-members to be sent
  //And unsets 'old' team-members
  //
  //Albeit this behaviour can easily be adjusted
  async updateTeam(teamId: string, updatedDetails: UpdateTeamRequest) {
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

  async deleteTeam(teamId: string) {
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

    await this.db.delete(teams).where(eq(teams.id, teamId));
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
      .select({

      }).from(replacements)
      .where(eq(replacements.leavingInternalId, studentId));

    //Don't have an existing replacement proposed
    if (replacement.length === 0) {
      await this.db
        .insert(replacements)
        .values({
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
      }).from(replacements)
      .where(eq(replacements.leavingInternalId, studentId));

    if (replacement === undefined || replacement.team_id === null) {
      throw new HTTPError(badRequest);
    }


    if (accepting ) {
      //Set students team to null
      await this.userService.updateStudentDetails(studentId, { team: null});

      //If a replacement is proposed
      //I believe if not its an empty string 
      if (replacement.replacing !== undefined && replacement.replacing.length !== 0) {
        //Set replacements team to the current team
        const [replacementInternalId] = await this.db
          .select({
            id: studentDetails.userId,
          }).from(studentDetails)
          .where(eq(studentDetails.studentId, replacement.replacing));

        await this.userService.updateStudentDetails(replacementInternalId.id, { team: replacement.team_id });
      }
    }

    //Delete replacement request from db
    await this.db.delete(replacements).where(eq(replacements.leavingInternalId, studentId));
    
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

    await this.userService.updateStudentDetails(studentInternalId, { team: replacingInfo.team });
    await this.userService.updateStudentDetails(replacingInfo.internalId, { team: teamId });

    return {
      allocDetails: [{
        sId: replacingStudentId,
        team: teamId,

      },
      {
        sId: replacedInfo.studentId,
        team: replacingInfo.team,
      }
    ]}

  }
}
