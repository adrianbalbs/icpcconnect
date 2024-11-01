import { eq, inArray } from "drizzle-orm";
import { DatabaseConnection, teams, students, users, universities } from "../db/index.js";
import { CreateTeamRequest, UpdateTeamRequest } from "../schemas/index.js";
import { badRequest, HTTPError } from "../utils/errors.js";

export type GetTeamsFromInstitution = {
  university: string,
  teamName: string | null,
  teamId: string,
  members: string[],
  flagged: boolean
}

export type GetTeamsFromInstitutionResponse = {
  teams: GetTeamsFromInstitution[]
}

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

    const members = await this.db.query.students.findMany({
      where: inArray(students.userId, memberIds),
    });

    for (const member of members) {
      await this.db
        .update(students)
        .set({ team: id.teamId })
        .where(eq(students.userId, member.userId));
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
      .from(students)
      .where(eq(students.userId, studentId))
      .leftJoin(teams, eq(teams.id, students.team));

    if (team == undefined) {
      throw new HTTPError(badRequest);
    }

    const members = await this.db
      .select({
        id: users.id,
        givenName: users.givenName,
        familyName: users.familyName,
        studentId: students.studentId,
        email: users.email,
      })
      .from(students)
      .where(eq(students.team, String(team.id)))
      .innerJoin(users, eq(users.id, students.userId));

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
          const members = await tx.query.students.findMany({
            where: eq(students.team, teamId),
          });

          for (const member of members) {
            await tx
              .update(students)
              .set({ team: null })
              .where(eq(students.userId, member.userId));
          }
        }

        //Set team-id for new members
        const members = await tx.query.students.findMany({
          where: inArray(students.userId, memberIds),
        });

        for (const member of members) {
          await tx
            .update(students)
            .set({ team: teamId })
            .where(eq(students.userId, member.userId));
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

  async getTeamsFromSite(siteId: number): Promise<GetTeamsFromInstitutionResponse> {
    const returnedTeams: GetTeamsFromInstitution[] = [];

    const groups = await this.db
      .select({
        flagged: teams.flagged,
        university: universities.name,
        teamName: teams.name,
        teamid: teams.id
      })
      .from(teams)
      .innerJoin(universities, eq(universities.hostedAt, siteId))
      .where(eq(teams.university, universities.id))

      for (const group of groups) {
        const stus = await this.db
          .select({
            given: users.givenName,
            family: users.familyName,
          })
          .from(users)
          .innerJoin(students, eq(students.team, group.teamid))
          .where(eq(users.id, students.userId))
        
        const groupStus: string[] = []
        for (const stu of stus) {
          groupStus.push(stu.given + " " + stu.family)
        }

        const finalGroup: GetTeamsFromInstitution = {
          university: group.university,
          teamName: group.teamName,
          teamId: group.teamid,
          members: groupStus,
          flagged: group.flagged,
        }

        returnedTeams.push(finalGroup)
      }

    return { teams: returnedTeams };
  }

  async getTeamsFromUni(uniId: number): Promise<GetTeamsFromInstitutionResponse> {
    const returnedTeams: GetTeamsFromInstitution[] = [];

    const groups = await this.db
      .select({
        flagged: teams.flagged,
        university: universities.name,
        teamName: teams.name,
        teamid: teams.id
      })
      .from(teams)
      .innerJoin(universities, eq(universities.id, uniId))
      .where(eq(teams.university, universities.id))

      for (const group of groups) {
        const stus = await this.db
          .select({
            given: users.givenName,
            family: users.familyName,
          })
          .from(users)
          .innerJoin(students, eq(students.team, group.teamid))
          .where(eq(users.id, students.userId))
        
          const groupStus: string[] = []
          for (const stu of stus) {
            groupStus.push(stu.given + " " + stu.family)
          }

        const finalGroup: GetTeamsFromInstitution = {
          university: group.university,
          teamName: group.teamName,
          teamId: group.teamid,
          members: groupStus.sort(),
          flagged: group.flagged,
        }

        returnedTeams.push(finalGroup)
      }

    return { teams: returnedTeams };
  }
}
