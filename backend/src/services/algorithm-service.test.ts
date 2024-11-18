import { describe, expect, it } from "vitest";
import { DatabaseConnection } from "../db/index.js";
import {
  CourseNames,
  LanguageExperience,
  UserDTO,
} from "../schemas/user-schema.js";
import { TeamService, UserService, AlgorithmService } from "./index.js";

describe("Algorithm Service Tests", () => {
  const createUser = ({
    id,
    studentId,
    givenName,
    familyName,
    preferences = "",
    exclusions = "",
    languagesSpoken = [{ code: "en", name: "English" }],
    pythonExperience = "some",
    javaExperience = "none",
    cExperience = "none",
    cppExperience = "none",
    coursesCompleted = [
      { id: 1, type: "Programming Fundamentals" as CourseNames },
    ],
  }: {
    id: string;
    studentId: string;
    givenName: string;
    familyName: string;
    preferences?: string;
    exclusions?: string;
    languagesSpoken?: { code: string; name: string }[];
    pythonExperience?: LanguageExperience;
    javaExperience?: LanguageExperience;
    cExperience?: LanguageExperience;
    cppExperience?: LanguageExperience;
    coursesCompleted?: { id: number; type: CourseNames }[];
  }): UserDTO => ({
    id,
    studentId,
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
    profile_pic: "",
  });

  const service = new AlgorithmService(
    {} as DatabaseConnection,
    {} as UserService,
    {} as TeamService,
  );

  it("should form two teams from six students", () => {
    const users = [
      createUser({
        id: "1",
        studentId: "1",
        givenName: "Adrian",
        familyName: "Balbalosa",
      }),
      createUser({
        id: "2",
        studentId: "2",
        givenName: "Yian",
        familyName: "Li",
      }),
      createUser({
        id: "3",
        studentId: "3",
        givenName: "Kobe",
        familyName: "Shen",
      }),
      createUser({
        id: "4",
        studentId: "4",
        givenName: "Delph",
        familyName: "Zhou",
      }),
      createUser({
        id: "5",
        studentId: "5",
        givenName: "Zac",
        familyName: "Ecob",
      }),
      createUser({
        id: "6",
        studentId: "6",
        givenName: "Jerry",
        familyName: "Yang",
      }),
    ];

    const teams = service.processStudents(users);
    expect(teams).toHaveLength(2);
    expect(teams.every((team) => team.ids.length === 3)).toBe(true);
  });

  it("should only form one team if there is an uneven number of students", () => {
    const users = [
      createUser({
        id: "1",
        studentId: "1",
        givenName: "Adrian",
        familyName: "Balbalosa",
      }),
      createUser({
        id: "2",
        studentId: "2",
        givenName: "Yian",
        familyName: "Li",
      }),
      createUser({
        id: "3",
        studentId: "3",
        givenName: "Kobe",
        familyName: "Shen",
      }),
      createUser({
        id: "4",
        studentId: "4",
        givenName: "Delph",
        familyName: "Zhou",
      }),
      createUser({
        id: "5",
        studentId: "5",
        givenName: "Zac",
        familyName: "Ecob",
      }),
    ];

    const teams = service.processStudents(users);
    expect(teams).toHaveLength(1);
    expect(teams.every((team) => team.ids.length === 3)).toBe(true);
  });

  it("should not form a team if the students don't speak the same language", () => {
    const users = [
      createUser({
        id: "1",
        studentId: "1",
        givenName: "Adrian",
        familyName: "Balbalosa",
        languagesSpoken: [{ code: "en", name: "English" }],
      }),
      createUser({
        id: "2",
        studentId: "2",
        givenName: "Yian",
        familyName: "Li",
        languagesSpoken: [{ code: "fr", name: "French" }],
      }),
      createUser({
        id: "3",
        studentId: "3",
        givenName: "Kobe",
        familyName: "Shen",
        languagesSpoken: [{ code: "de", name: "German" }],
      }),
    ];

    const teams = service.processStudents(users);
    expect(teams).toHaveLength(0);
  });

  it("should not form a team if one of the students has no programming experience", () => {
    const users = [
      createUser({
        id: "1",
        studentId: "1",
        givenName: "Adrian",
        familyName: "Balbalosa",
        pythonExperience: "none",
        javaExperience: "none",
        cExperience: "none",
        cppExperience: "none",
        languagesSpoken: [{ code: "en", name: "English" }],
      }),
      createUser({
        id: "2",
        studentId: "2",
        givenName: "Yian",
        familyName: "Li",
      }),
      createUser({
        id: "3",
        studentId: "3",
        givenName: "Kobe",
        familyName: "Shen",
      }),
    ];

    const teams = service.processStudents(users);
    expect(teams).toHaveLength(0);
  });

  it("should be flagged if a student has an exclusion with a team member", () => {
    const users = [
      createUser({
        id: "1",
        studentId: "1",
        givenName: "Adrian",
        familyName: "Balbalosa",
        exclusions: "Yian",
      }),
      createUser({
        id: "2",
        studentId: "2",
        givenName: "Yian",
        familyName: "Li",
      }),
      createUser({
        id: "3",
        studentId: "3",
        givenName: "Kobe",
        familyName: "Shen",
      }),
    ];

    const teams = service.processStudents(users);
    expect(teams[0].flagged).toBe(true);
  });

  it("should form a team for a student who has requested a pair", () => {
    const users = [
      createUser({
        id: "1",
        studentId: "1",
        givenName: "Adrian",
        familyName: "Balbalosa",
        preferences: "2",
      }),
      createUser({
        id: "2",
        studentId: "2",
        givenName: "Yian",
        familyName: "Li",
      }),
      createUser({
        id: "3",
        studentId: "3",
        givenName: "Kobe",
        familyName: "Shen",
      }),
      createUser({
        id: "4",
        studentId: "4",
        givenName: "Delph",
        familyName: "Zhou",
      }),
      createUser({
        id: "5",
        studentId: "5",
        givenName: "Zac",
        familyName: "Ecob",
      }),
      createUser({
        id: "6",
        studentId: "6",
        givenName: "Jerry",
        familyName: "Yang",
      }),
    ];

    const teams = service.processStudents(users);
    expect(teams).toHaveLength(2);
    expect(teams[0].ids).toContain("1");
    expect(teams[0].ids).toContain("2");
  });

  it("should still form a team if a student's pair does not exist", () => {
    const users = [
      createUser({
        id: "1",
        studentId: "1",
        givenName: "Adrian",
        familyName: "Balbalosa",
        preferences: "999",
      }),
      createUser({
        id: "2",
        studentId: "2",
        givenName: "Yian",
        familyName: "Li",
      }),
      createUser({
        id: "3",
        studentId: "3",
        givenName: "Kobe",
        familyName: "Shen",
      }),
    ];

    const teams = service.processStudents(users);
    expect(teams).toHaveLength(1);
  });

  it("should form a team of 2 students who have signed up as a pair if the third is incompatable", () => {
    const users = [
      createUser({
        id: "1",
        studentId: "1",
        givenName: "Adrian",
        familyName: "Balbalosa",
        preferences: "2",
      }),
      createUser({
        id: "2",
        studentId: "2",
        givenName: "Yian",
        familyName: "Li",
      }),
      createUser({
        id: "3",
        studentId: "3",
        givenName: "Kobe",
        familyName: "Shen",
        languagesSpoken: [{ code: "fr", name: "French" }],
      }),
    ];

    const teams = service.processStudents(users);
    expect(teams).toHaveLength(1);
  });

  it("should not form a team if there is not enough people to form a pair", () => {
    const users = [
      createUser({
        id: "1",
        studentId: "1",
        givenName: "Adrian",
        familyName: "Balbalosa",
      }),
    ];

    const teams = service.processStudents(users);
    expect(teams).toHaveLength(0);
  });

  it("should be flagged if either pair has an exclusion with the third student", () => {
    const users = [
      createUser({
        id: "1",
        studentId: "1",
        givenName: "Adrian",
        familyName: "Balbalosa",
        preferences: "2",
        exclusions: "Kobe",
      }),
      createUser({
        id: "2",
        studentId: "2",
        givenName: "Yian",
        familyName: "Li",
      }),
      createUser({
        id: "3",
        studentId: "3",
        givenName: "Kobe",
        familyName: "Shen",
      }),
    ];

    const teams = service.processStudents(users);
    expect(teams[0].flagged).toBe(true);
  });

  it("should form a full team for a student who registers as a full team", () => {
    const users = [
      createUser({
        id: "1",
        studentId: "1",
        givenName: "Adrian",
        familyName: "Balbalosa",
        preferences: "2, 3",
      }),
      createUser({
        id: "2",
        studentId: "2",
        givenName: "Yian",
        familyName: "Li",
      }),
      createUser({
        id: "3",
        studentId: "3",
        givenName: "Kobe",
        familyName: "Shen",
      }),
      createUser({
        id: "4",
        studentId: "4",
        givenName: "Delph",
        familyName: "Zhou",
      }),
      createUser({
        id: "5",
        studentId: "5",
        givenName: "Zac",
        familyName: "Ecob",
      }),
      createUser({
        id: "6",
        studentId: "6",
        givenName: "Jerry",
        familyName: "Yang",
      }),
    ];

    const teams = service.processStudents(users);
    expect(teams).toHaveLength(2);
    expect(teams[0].ids).toContain("1");
    expect(teams[0].ids).toContain("2");
    expect(teams[0].ids).toContain("3");
  });

  it("should not form a team if the student's second preference does not exist", () => {
    const users = [
      createUser({
        id: "1",
        studentId: "1",
        givenName: "Adrian",
        familyName: "Balbalosa",
        preferences: "2, 3",
      }),
      createUser({
        id: "2",
        studentId: "2",
        givenName: "Yian",
        familyName: "Li",
      }),
    ];

    const teams = service.processStudents(users);
    expect(teams).toHaveLength(0);
  });
});
