import { and, eq, inArray } from "drizzle-orm";
import {
  DatabaseConnection,
  teams,
  studentDetails,
  users,
} from "../db/index.js";
import { CreateTeamRequest, UpdateTeamRequest } from "../schemas/index.js";
import { badRequest, HTTPError } from "../utils/errors.js";

export class TeamService {
  private readonly db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
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
      with: { members: true, university: true },
    });

    if (team == undefined) {
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

    if (team == undefined) {
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

    return { ...team, members };
  }

  async getAllTeams() {
    return await this.db.query.teams.findMany({
      columns: { university: false },
      with: { members: true, university: true },
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
}
