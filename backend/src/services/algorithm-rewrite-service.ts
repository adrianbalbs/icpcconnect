import { Heap } from "heap-js";
import { universities } from "../db/schema.js";
import { DatabaseConnection } from "../db/database.js";
import { TeamService } from "./team-service.js";
import { UserService } from "./user-service.js";
import { LanguageExperience, UserDTO } from "src/schemas/user-schema.js";
import { CreateTeamRequest } from "src/schemas/team-schema.js";
import { eq, not } from "drizzle-orm";

type Student = Omit<UserDTO, "exclusions" | "preferences"> & {
  score: number;
  exclusions: Set<string>;
  preferences: Set<string>;
};

type Team = {
  ids: string[];
  flagged: boolean;
};

type Score = {
  score: number;
  pythonExperience: LanguageExperience;
  javaExperience: LanguageExperience;
  cExperience: LanguageExperience;
  cppExperience: LanguageExperience;
  languagesSpoken: { code: string; name: string }[];
};

const experienceMap = {
  none: 0,
  some: 1,
  prof: 2,
} as const;

export class AlgorithmRewriteService {
  private readonly contestWeight = 5;
  private readonly leetcodeWeight = 4;
  private readonly codeforcesWeight = 4;
  private readonly coursesWeight = 3;

  constructor(
    private readonly db: DatabaseConnection,
    private readonly userService: UserService,
    private readonly teamService: TeamService,
  ) {}

  async getAllUniversities(): Promise<{ id: number; name: string }[]> {
    // Ignore the N/A University
    const allUniversities = await this.db
      .select({
        id: universities.id,
        name: universities.name,
      })
      .from(universities)
      .where(not(eq(universities.id, 0)));

    return allUniversities;
  }

  private getPreferences(s: string): Set<string> {
    if (s === "" || s === "none") {
      return new Set();
    } else {
      return new Set(s.split(", "));
    }
  }

  private getExclusions(s: string): Set<string> {
    if (s === "" || s === "none") {
      return new Set();
    } else {
      return new Set(s.split(", "));
    }
  }

  private calculateScore(student: UserDTO): number {
    return (
      student.contestExperience * this.contestWeight +
      (student.leetcodeRating / 1000) * this.leetcodeWeight +
      (student.codeforcesRating / 1000) * this.codeforcesWeight +
      student.coursesCompleted
        .map((c) => c.id)
        .reduce((acc, course) => acc + course * this.coursesWeight, 0)
    );
  }

  private maxExperience(
    experience1: LanguageExperience,
    experience2: LanguageExperience,
  ): LanguageExperience {
    return experienceMap[experience1] >= experienceMap[experience2]
      ? experience1
      : experience2;
  }

  private isCompatible(student1: Score, student2: Score): boolean {
    const sameCoding =
      (student1.pythonExperience !== "none" &&
        student2.pythonExperience !== "none") ||
      (student1.javaExperience !== "none" &&
        student2.javaExperience !== "none") ||
      (student1.cExperience !== "none" && student2.cExperience !== "none") ||
      (student1.cppExperience !== "none" && student2.cppExperience !== "none");

    const spoken1 = new Set(student1.languagesSpoken.map((l) => l.code));
    const spoken2 = new Set(student2.languagesSpoken.map((l) => l.code));
    const intersect = new Set([...spoken1].filter((item) => spoken2.has(item)));
    const sameSpoken = intersect.size > 0;

    return sameCoding && sameSpoken;
  }

  private processStudentsWithFullTeam(
    studentsWithFullTeam: Student[],
    studentMap: Map<string, Student>,
    teams: Team[],
  ) {
    for (const student of studentsWithFullTeam) {
      const prefs = Array.from(student.preferences);
      const teamIds: string[] = [];
      for (const pref of prefs) {
        if (studentMap.has(pref)) {
          const stuPref = studentMap.get(pref)!;
          teamIds.push(stuPref.id);
          studentMap.delete(pref);
        } else {
          // Remove the preference from the student, will now be treated as a pair or individual
          const studentEntry = studentMap.get(student.studentId)!;
          studentEntry.preferences.delete(pref);
          studentMap.set(student.studentId, studentEntry);
        }
      }

      if (teamIds.length === 2) {
        teamIds.push(student.id);
        studentMap.delete(student.studentId);
        teams.push({ ids: teamIds, flagged: false });
      }
    }
  }

  private processPairPreferences(
    studentMap: Map<string, Student>,
    studentsWithPairs: Student[],
    pq: Heap<Student>,
    teams: Team[],
  ) {
    for (const student of studentsWithPairs) {
      const [fst] = Array.from(student.preferences);
      const teamIds: string[] = [];
      if (studentMap.has(fst)) {
        const pref = studentMap.get(fst)!;
        pq.remove(pref);
        studentMap.delete(fst);
        teamIds.push(pref.id);

        const score = Math.max(student.score, pref.score);
        const languagesSpoken = [
          ...new Set([...student.languagesSpoken, ...pref.languagesSpoken]),
        ];
        const cppExperience = this.maxExperience(
          student.cppExperience,
          pref.cppExperience,
        );
        const cExperience = this.maxExperience(
          student.cExperience,
          pref.cExperience,
        );
        const javaExperience = this.maxExperience(
          student.javaExperience,
          pref.javaExperience,
        );
        const pythonExperience = this.maxExperience(
          student.pythonExperience,
          pref.pythonExperience,
        );

        let compatibleFound = false;
        const tempQueue: Student[] = [];

        while (pq.size() > 0) {
          const potential = pq.pop()!;
          if (
            this.isCompatible(
              {
                score,
                languagesSpoken,
                cppExperience,
                cExperience,
                javaExperience,
                pythonExperience,
              },
              potential,
            )
          ) {
            compatibleFound = true;
            teamIds.push(potential.id);
            break;
          }
          tempQueue.push(potential);
        }

        // There is no more students to process, so remaining students wanting a pair must now be individual
        if (pq.size() === 0 && !compatibleFound) {
          pq.addAll(tempQueue);
          const remainingStudents = studentsWithPairs.slice(
            studentsWithPairs.indexOf(student),
          );
          remainingStudents.forEach((s) => pq.push(s));
          break;
        }
        // TODO: Handle exclusions
        teamIds.push(student.id);
        teams.push({ ids: teamIds, flagged: false });
      } else {
        pq.push(student);
      }
    }
  }

  private processIndividualStudents(pq: Heap<Student>, teams: Team[]) {
    while (pq.size() >= 3) {
      const fstStudent = pq.pop()!;
      const tempQueue: Student[] = [];
      let foundTeam = false;
      while (pq.size() > 0) {
        const sndStudent = pq.pop()!;
        if (!this.isCompatible(fstStudent, sndStudent)) {
          tempQueue.push(sndStudent);
          continue;
        }
        const tempQueue2: Student[] = [];
        //TODO: Deal with exclusions
        while (pq.size() > 0) {
          const thrdStudent = pq.pop()!;
          if (
            this.isCompatible(fstStudent, thrdStudent) &&
            this.isCompatible(sndStudent, thrdStudent)
          ) {
            teams.push({
              ids: [fstStudent.id, sndStudent.id, thrdStudent.id],
              flagged: false,
            });
            foundTeam = true;
            break;
          }
          tempQueue2.push(thrdStudent);
        }
        if (foundTeam) {
          pq.addAll(tempQueue2);
          break;
        } else {
          pq.addAll(tempQueue2);
          tempQueue.push(sndStudent);
        }
      }
      if (!foundTeam) {
        pq.push(fstStudent);
        pq.addAll(tempQueue);
        break;
      }
    }
  }

  processStudents(allUsers: UserDTO[]): Team[] {
    const studentMap = allUsers.reduce((map, user) => {
      const student = {
        ...user,
        score: this.calculateScore(user),
        preferences: this.getPreferences(user.preferences),
        exclusions: this.getExclusions(user.exclusions),
      };
      map.set(student.studentId, student);
      return map;
    }, new Map<string, Student>());

    const teams: Team[] = [];

    // We prioritise students with a full team first
    const studentsWithFullTeam = Array.from(studentMap)
      .filter(([, student]) => student.preferences.size === 2)
      .map(([, student]) => student);

    this.processStudentsWithFullTeam(studentsWithFullTeam, studentMap, teams);

    const individualStudents = Array.from(studentMap)
      .filter(([, student]) => student.preferences.size === 0)
      .map(([, student]) => student);

    const scoreComparator = (a: Student, b: Student) => b.score - a.score;
    const pq = new Heap(scoreComparator);
    pq.addAll(individualStudents);

    // Then we process all students who have a pair preference
    const studentsWithPairs = Array.from(studentMap)
      .filter(([, student]) => student.preferences.size === 1)
      .map(([, student]) => student)
      .sort(scoreComparator);

    this.processPairPreferences(studentMap, studentsWithPairs, pq, teams);

    // Finally, process the remaining individual students
    this.processIndividualStudents(pq, teams);
    return teams;
  }

  async run(contestId: string): Promise<{ success: boolean }> {
    const unis = await this.getAllUniversities();

    for (const { id, name } of unis) {
      const { allUsers } = await this.userService.getStudentsWithoutTeam(
        contestId,
        id,
      );
      const teams = this.processStudents(allUsers);
      let teamNum = 1;
      const teamRequests: CreateTeamRequest[] = teams.map((team) => {
        return {
          name: `${name} Team ${teamNum++}`,
          memberIds: team.ids,
          flagged: team.flagged,
          contest: contestId,
          university: id,
        };
      });

      for (const req of teamRequests) {
        await this.teamService.createTeam(req);
      }
    }

    return { success: true };
  }
}
