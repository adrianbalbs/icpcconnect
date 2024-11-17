import { describe, expect, it } from "vitest";
import { DatabaseConnection } from "../db/index.js";
import {
  CourseNames,
  LanguageExperience,
  UserDTO,
} from "../schemas/user-schema.js";
import { TeamService, UserService, AlgorithmService } from "./index.js";

describe("Algorithm Service Tests", () => {
  const createUser = (
    id: string,
    studentId: string,
    givenName: string,
    familyName: string,
    preferences = "",
    exclusions = "",
    languagesSpoken = [{ code: "en", name: "English" }],
    pythonExperience: LanguageExperience = "some",
    javaExperience: LanguageExperience = "none",
    cExperience: LanguageExperience = "none",
    cppExperience: LanguageExperience = "none",
    coursesCompleted = [
      { id: 1, type: "Programming Fundamentals" as CourseNames },
    ],
  ): UserDTO => ({
    id,
    studentId: studentId,
    givenName,
    familyName,
    email: "test@ad.com",
    pronouns: "",
    preferences,
    exclusions,
    role: "Student",
    university: "University",
    languagesSpoken,
    pythonExperience,
    javaExperience,
    cExperience,
    cppExperience,
    contestExperience: 0,
    leetcodeRating: 0,
    codeforcesRating: 0,
    coursesCompleted,
    team: null,
    level: "B",
    dietaryRequirements: "",
    photoConsent: false,
    tshirtSize: "",
  });

  const service = new AlgorithmService(
    {} as DatabaseConnection,
    {} as UserService,
    {} as TeamService,
  );
  it("should form two teams from six students", () => {
    const users = [
      createUser("1", "1", "Adrian", "Balbalosa"),
      createUser("2", "2", "Yian", "Li"),
      createUser("3", "3", "Kobe", "Shen"),
      createUser("4", "4", "Delph", "Zhou"),
      createUser("5", "5", "Zac", "Ecob"),
      createUser("6", "6", "Jerry", "Yang"),
    ];

    const teams = service.processStudents(users);
    expect(teams).toHaveLength(2);
    expect(teams.every((team) => team.ids.length === 3)).toBe(true);
  });

  it("should only form one team if there is an uneven number of students", () => {
    const users = [
      createUser("1", "1", "Adrian", "Balbalosa"),
      createUser("2", "2", "Yian", "Li"),
      createUser("3", "3", "Kobe", "Shen"),
      createUser("4", "4", "Delph", "Zhou"),
      createUser("5", "5", "Zac", "Ecob"),
    ];

    const teams = service.processStudents(users);
    expect(teams).toHaveLength(1);
    expect(teams.every((team) => team.ids.length === 3)).toBe(true);
  });

  it("should not form a team if the students don't speak the same language", () => {
    const users = [
      createUser("1", "1", "Adrian", "Balbalosa", "", "", [
        { code: "en", name: "English" },
      ]),
      createUser("2", "2", "Yian", "Li", "", "", [
        { code: "fr", name: "French" },
      ]),
      createUser("3", "3", "Kobe", "Shen", "", "", [
        { code: "de", name: "German" },
      ]),
    ];

    const teams = service.processStudents(users);
    expect(teams).toHaveLength(0);
  });

  it("should not form a team if one of the students has no programming experience", () => {
    const users = [
      createUser(
        "1",
        "1",
        "Adrian",
        "Balbalosa",
        "",
        "",
        [{ code: "en", name: "English" }],
        "none",
        "none",
        "none",
        "none",
      ),
      createUser("2", "2", "Yian", "Li"),
      createUser("3", "3", "Kobe", "Shen"),
    ];

    const teams = service.processStudents(users);
    expect(teams).toHaveLength(0);
  });

  it("should be flagged if a student has an exclusion with a team member", () => {
    const users = [
      createUser("1", "1", "Adrian", "Balbalosa", "", "Yian"),
      createUser("2", "2", "Yian", "Li"),
      createUser("3", "3", "Kobe", "Shen"),
    ];

    const teams = service.processStudents(users);
    expect(teams[0].flagged).toBe(true);
  });

  it("should form a team for a student who has requested a pair", () => {
    const users = [
      createUser("1", "1", "Adrian", "Balbalosa", "2"),
      createUser("2", "2", "Yian", "Li"),
      createUser("3", "3", "Kobe", "Shen"),
      createUser("4", "4", "Delph", "Zhou"),
      createUser("5", "5", "Zac", "Ecob"),
      createUser("6", "6", "Jerry", "Yang"),
    ];

    const teams = service.processStudents(users);
    expect(teams).toHaveLength(2);
    expect(teams[0].ids).toContain("1");
    expect(teams[0].ids).toContain("2");
  });

  it("should still form a team if a student's pair does not exist", () => {
    const users = [
      createUser("1", "1", "Adrian", "Balbalosa", "999"),
      createUser("2", "2", "Yian", "Li"),
      createUser("3", "3", "Kobe", "Shen"),
    ];

    const teams = service.processStudents(users);
    expect(teams).toHaveLength(1);
  });

  it("should not form a team if there is not enough people to form a pair", () => {
    const users = [createUser("1", "1", "Adrian", "Balbalosa")];

    const teams = service.processStudents(users);
    expect(teams).toHaveLength(0);
  });

  it("should be flagged if either pair has an exclusion with the third student", () => {
    const users = [
      createUser("1", "1", "Adrian", "Balbalosa", "2", "Kobe"),
      createUser("2", "2", "Yian", "Li"),
      createUser("3", "3", "Kobe", "Shen"),
    ];

    const teams = service.processStudents(users);
    console.log(teams);
    expect(teams[0].flagged).toBe(true);
  });

  it("should form a full team for a student who registers as a full team", () => {
    const users = [
      createUser("1", "1", "Adrian", "Balbalosa", "2, 3"),
      createUser("2", "2", "Yian", "Li"),
      createUser("3", "3", "Kobe", "Shen"),
      createUser("4", "4", "Delph", "Zhou"),
      createUser("5", "5", "Zac", "Ecob"),
      createUser("6", "6", "Jerry", "Yang"),
    ];

    const teams = service.processStudents(users);
    expect(teams).toHaveLength(2);
    expect(teams[0].ids).toContain("1");
    expect(teams[0].ids).toContain("2");
    expect(teams[0].ids).toContain("3");
  });

  it("should not form a team if the student's second preference does not exist", () => {
    const users = [
      createUser("1", "1", "Adrian", "Balbalosa", "2, 3"),
      createUser("2", "2", "Yian", "Li"),
    ];

    const teams = service.processStudents(users);
    expect(teams).toHaveLength(0);
  });
});
