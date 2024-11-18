import { Heap } from "heap-js";
import { TeamService } from "./team-service.js";
import { UserService } from "./user-service.js";
import { LanguageExperience, UserDTO } from "src/schemas/user-schema.js";
import { CreateTeamRequest } from "src/schemas/team-schema.js";

type Student = Omit<
  UserDTO,
  "exclusions" | "preferences" | "givenName" | "familyName"
> & {
  name: string;
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

export class AlgorithmService {
  private readonly contestWeight = 5;
  private readonly leetcodeWeight = 4;
  private readonly codeforcesWeight = 4;
  private readonly coursesWeight = 3;

  constructor(
    private readonly userService: UserService,
    private readonly teamService: TeamService,
  ) {}

  /**
   * Converts a string (comma-separated) into a Set of items.
   *
   * @param {string} s The string to be converted.
   * @param {string} [defaultValue="none"] The value to treat as empty.
   * @returns {Set<string>} A Set containing the items as individual elements.
   */
  private parseToSet(s: string, defaultValue: string = "none"): Set<string> {
    if (s === "" || s === defaultValue) {
      return new Set();
    }
    return new Set(s.split(", "));
  }

  /**
   * Calculates the score for a student based on various factors like contest experience,
   * Leetcode/Codeforces rating, and completed courses.
   *
   * @param {UserDTO} student The student object containing the user's data.
   * @returns {number} The calculated score.
   */
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

  /**
   * Returns the maximum experience between two LanguageExperience values.
   *
   * @param {LanguageExperience} experience1 The first experience value.
   * @param {LanguageExperience} experience2 The second experience value.
   * @returns {LanguageExperience} The experience with the higher level.
   */
  private maxExperience(
    experience1: LanguageExperience,
    experience2: LanguageExperience,
  ): LanguageExperience {
    return experienceMap[experience1] >= experienceMap[experience2]
      ? experience1
      : experience2;
  }

  /**
   * Checks whether two students are compatible based on their coding languages and spoken languages.
   *
   * @param {Score} student1 The first student's score and language data.
   * @param {Score} student2 The second student's score and language data.
   * @returns {boolean} True if the students are compatible, false otherwise.
   */
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

  /**
   * Processes students who have full teams (2 preferences) and assigns them to teams.
   *
   * @param {Student[]} studentsWithFullTeam The list of students with full team preferences.
   * @param {Map<string, Student>} studentMap A map of student IDs to student objects.
   * @param {Team[]} teams The array to store the created teams.
   */
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

  /**
   * Checks if a team contains any exclusions based on the students' preferences.
   *
   * @param {Student[]} team The list of students in the team.
   * @returns {boolean} True if the team has an exclusion, false otherwise.
   */
  private checkExclusions(team: Student[]): boolean {
    for (const student of team) {
      for (const otherStudent of team) {
        if (
          student !== otherStudent &&
          Array.from(student.exclusions).some((excludedName) =>
            otherStudent.name
              .toLowerCase()
              .includes(excludedName.toLowerCase()),
          )
        ) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Combines the data from two students into a single object containing the maximum values for their experiences
   * and the combined language set.
   *
   * @param {Student} student1 The first student
   * @param {Student} student2 The second student
   * @returns {Score} The maximum score between both students
   */
  private combineStudentData(student1: Student, student2: Student): Score {
    const score = Math.max(student1.score, student2.score);
    const languagesSpoken = [
      ...new Set([...student1.languagesSpoken, ...student2.languagesSpoken]),
    ];
    const cppExperience = this.maxExperience(
      student1.cppExperience,
      student2.cppExperience,
    );
    const cExperience = this.maxExperience(
      student1.cExperience,
      student2.cExperience,
    );
    const javaExperience = this.maxExperience(
      student1.javaExperience,
      student2.javaExperience,
    );
    const pythonExperience = this.maxExperience(
      student1.pythonExperience,
      student2.pythonExperience,
    );

    return {
      score,
      languagesSpoken,
      cppExperience,
      cExperience,
      javaExperience,
      pythonExperience,
    };
  }

  /**
   * Processes students who have one preference (pair preference) and attempts to match them with compatible students.
   *
   * @param {Map<string, Student>} studentMap A map of student IDs to student objects.
   * @param {Student[]} studentsWithPairs The list of students with one preference.
   * @param {Heap<Student>} pq The priority queue to manage students based on score.
   * @param {Team[]} teams The array to store the created teams.
   */
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

        const {
          score,
          languagesSpoken,
          cppExperience,
          cExperience,
          javaExperience,
          pythonExperience,
        } = this.combineStudentData(student, pref);

        const tempQueue: Student[] = [];
        let flagged = false;

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
            teamIds.push(potential.id);
            flagged =
              this.checkExclusions([student, potential]) ||
              this.checkExclusions([pref, potential]);
            break;
          }
          tempQueue.push(potential);
        }

        // No compatible student was found, students will form a pair
        teamIds.push(student.id);
        teams.push({ ids: teamIds, flagged });
      } else {
        pq.push(student);
      }
    }
  }

  /**
   * Processes remaining individual students, forming teams of three based on compatibility.
   *
   * @param {Heap<Student>} pq The priority queue with individual students to process.
   * @param {Team[]} teams The array to store the created teams.
   */
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

        while (pq.size() > 0) {
          const thrdStudent = pq.pop()!;
          if (
            this.isCompatible(fstStudent, thrdStudent) &&
            this.isCompatible(sndStudent, thrdStudent)
          ) {
            teams.push({
              ids: [fstStudent.id, sndStudent.id, thrdStudent.id],
              flagged: this.checkExclusions([
                fstStudent,
                sndStudent,
                thrdStudent,
              ]),
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

  /**
   * Main function to process all students and form teams for each university.
   *
   * @param {UserDTO[]} allUsers An array of user objects representing all students.
   * @returns {Team[]} An array of newly formed teams.
   */
  processStudents(allUsers: UserDTO[]): Team[] {
    const studentMap = allUsers.reduce((map, user) => {
      const student = {
        ...user,
        name: `${user.givenName} ${user.familyName}`,
        score: this.calculateScore(user),
        preferences: this.parseToSet(user.preferences),
        exclusions: this.parseToSet(user.exclusions),
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

  /**
   * Runs the algorithm to form teams for each university for a specific contest.
   *
   * @param {string} contestId The ID of the contest for which to form teams.
   * @returns {Promise<{ success: boolean }>} A promise that resolves with a success status.
   */
  async run(contestId: string): Promise<{ success: boolean }> {
    const { allUnis } = await this.userService.getAllUniversities();

    for (const { id, name } of allUnis) {
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
