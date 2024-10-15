import { describe, beforeEach, it, expect, afterEach } from "vitest";
import {
  StudentInfo,
  Experience,
  calculateScore,
  algorithm,
  getStudentScores,
} from "./algorithm.js";

let test_studentInfo: StudentInfo[] = [];
let s1: StudentInfo;
let s2: StudentInfo;

beforeEach(() => {
  test_studentInfo = [];

  s1 = {
    id: 1,
    uniId: 1,
    contestExperience: 6,
    leetcodeRating: 1500,
    codeforcesRating: 1500,
    completedCourses: [
      "intro_computing",
      "data_struct_and_algos",
      "discrete_math",
      "algorithms",
      "prog_chal",
    ],
    spokenLanguages: [],
    cppExperience: Experience.none,
    cExpericence: Experience.none,
    javaExperience: Experience.none,
    pythonExperience: Experience.none,

    paired_with: null,
    markdone: false,
  };

  s2 = {
    id: 2,
    uniId: 1,
    contestExperience: 6,
    leetcodeRating: 1500,
    codeforcesRating: 1500,
    completedCourses: [
      "intro_computing",
      "data_struct_and_algos",
      "discrete_math",
      "algorithms",
    ],
    spokenLanguages: [],
    cppExperience: Experience.none,
    cExpericence: Experience.none,
    javaExperience: Experience.none,
    pythonExperience: Experience.none,

    paired_with: null,
    markdone: false,
  };

  test_studentInfo.push(s1);
  test_studentInfo.push(s2);
});

afterEach(() => {
  test_studentInfo = [];
});

describe("Algorithm Unit Tests", () => {
  it("calculateScore: Should return true (s1.score > s2.score)", async () => {
    const score1 = calculateScore(s1);
    const score2 = calculateScore(s2);

    expect(score1).toBeGreaterThan(score2);
  });

  it("getStudentScores: Should return an array of two StudentScore objects", () => {
    const calcscores = getStudentScores(test_studentInfo);

    expect(calcscores.length == 2);

    expect(calcscores[0]).toEqual({
      ids: [s1.id],
      studentScore: calculateScore(s1),
    });
    expect(calcscores[1]).toEqual({
      ids: [s2.id],
      studentScore: calculateScore(s2),
    });

    expect(s1.markdone).toBe(true);
    expect(s2.markdone).toBe(true);
  });

  it("getStudentScores: Should return an array of one StudentScore object (a pair)", () => {
    s1.paired_with = s2.id;
    s2.paired_with = s1.id;

    const calcscores = getStudentScores(test_studentInfo);

    expect(calcscores.length == 1);

    expect(calcscores[0]).toEqual({
      ids: [s1.id, s2.id],
      studentScore: (calculateScore(s1) + calculateScore(s2)) / 2,
    });

    expect(s1.markdone).toBe(true);
    expect(s2.markdone).toBe(true);
  });

  it("getStudentScores: Should return an array of two StudentScore object (a pair and a single)", () => {
    const s3: StudentInfo = {
      id: 3,
      uniId: 1,
      contestExperience: 6,
      leetcodeRating: 3000,
      codeforcesRating: 3000,
      completedCourses: [
        "intro_computing",
        "data_struct_and_algos",
        "discrete_math",
        "algorithms",
      ],
      spokenLanguages: [],
      cppExperience: Experience.none,
      cExpericence: Experience.none,
      javaExperience: Experience.none,
      pythonExperience: Experience.none,

      paired_with: s1.id,
      markdone: false,
    };

    test_studentInfo.push(s3);

    s1.paired_with = s3.id;

    const calcscores = getStudentScores(test_studentInfo);

    expect(calcscores.length == 1);

    expect(calcscores[0]).toEqual({
      ids: [s1.id, s3.id],
      studentScore: (calculateScore(s1) + calculateScore(s3)) / 2,
    });
    expect(calcscores[1]).toEqual({
      ids: [s2.id],
      studentScore: calculateScore(s2),
    });

    expect(s1.markdone).toBe(true);
    expect(s2.markdone).toBe(true);
    expect(s3.markdone).toBe(true);
  });

  it("algorithm: Should return a singular team (Pair and Single)", () => {
    const s3: StudentInfo = {
      id: 3,
      uniId: 1,
      contestExperience: 6,
      leetcodeRating: 3000,
      codeforcesRating: 3000,
      completedCourses: [
        "intro_computing",
        "data_struct_and_algos",
        "discrete_math",
        "algorithms",
      ],
      spokenLanguages: [],
      cppExperience: Experience.none,
      cExpericence: Experience.none,
      javaExperience: Experience.none,
      pythonExperience: Experience.none,

      paired_with: s1.id,
      markdone: false,
    };

    test_studentInfo.push(s3);

    s1.paired_with = s3.id;

    const calcscores = getStudentScores(test_studentInfo);

    expect(calcscores.length).toEqual(2);

    expect(calcscores[0]).toEqual({
      ids: [s1.id, s3.id],
      studentScore: (calculateScore(s1) + calculateScore(s3)) / 2,
    });
    expect(calcscores[1]).toEqual({
      ids: [s2.id],
      studentScore: calculateScore(s2),
    });

    expect(s1.markdone).toBe(true);
    expect(s2.markdone).toBe(true);
    expect(s3.markdone).toBe(true);

    const groups = algorithm(calcscores);

    expect(groups.length).toEqual(1);

    expect(groups[0]).toEqual({
      ids: [s1.id, s3.id, s2.id],
      totalScore: calculateScore(s1) + calculateScore(s2) + calculateScore(s3),
    });
  });

  it("algorithm: Should return a singular team (Three Singles)", () => {
    const s3: StudentInfo = {
      id: 3,
      uniId: 1,
      contestExperience: 6,
      leetcodeRating: 3000,
      codeforcesRating: 3000,
      completedCourses: [
        "intro_computing",
        "data_struct_and_algos",
        "discrete_math",
        "algorithms",
      ],
      spokenLanguages: [],
      cppExperience: Experience.none,
      cExpericence: Experience.none,
      javaExperience: Experience.none,
      pythonExperience: Experience.none,

      paired_with: null,
      markdone: false,
    };

    test_studentInfo.push(s3);

    const calcscores = getStudentScores(test_studentInfo);

    expect(calcscores.length).toEqual(3);

    expect(calcscores[0]).toEqual({
      ids: [s1.id],
      studentScore: calculateScore(s1),
    });
    expect(calcscores[1]).toEqual({
      ids: [s2.id],
      studentScore: calculateScore(s2),
    });
    expect(calcscores[2]).toEqual({
      ids: [s3.id],
      studentScore: calculateScore(s3),
    });

    expect(s1.markdone).toBe(true);
    expect(s2.markdone).toBe(true);
    expect(s3.markdone).toBe(true);

    const groups = algorithm(calcscores);

    expect(groups.length).toEqual(1);

    expect(groups[0]).toEqual({
      ids: [s3.id, s1.id, s2.id],
      totalScore: calculateScore(s1) + calculateScore(s2) + calculateScore(s3),
    });
  });

  it("algorithm: Should return a singular team (Four Singles (1 Excluded))", () => {
    const s3: StudentInfo = {
      id: 3,
      uniId: 1,
      contestExperience: 6,
      leetcodeRating: 3000,
      codeforcesRating: 3000,
      completedCourses: [
        "intro_computing",
        "data_struct_and_algos",
        "discrete_math",
        "algorithms",
      ],
      spokenLanguages: [],
      cppExperience: Experience.none,
      cExpericence: Experience.none,
      javaExperience: Experience.none,
      pythonExperience: Experience.none,

      paired_with: null,
      markdone: false,
    };

    const s4: StudentInfo = {
      id: 4,
      uniId: 1,
      contestExperience: 2,
      leetcodeRating: 500,
      codeforcesRating: 500,
      completedCourses: ["intro_computing"],
      spokenLanguages: [],
      cppExperience: Experience.none,
      cExpericence: Experience.none,
      javaExperience: Experience.none,
      pythonExperience: Experience.none,

      paired_with: null,
      markdone: false,
    };

    test_studentInfo.push(s3);
    test_studentInfo.push(s4);

    const calcscores = getStudentScores(test_studentInfo);

    expect(calcscores.length).toEqual(4);

    expect(calcscores[0]).toEqual({
      ids: [s1.id],
      studentScore: calculateScore(s1),
    });
    expect(calcscores[1]).toEqual({
      ids: [s2.id],
      studentScore: calculateScore(s2),
    });
    expect(calcscores[2]).toEqual({
      ids: [s3.id],
      studentScore: calculateScore(s3),
    });
    expect(calcscores[3]).toEqual({
      ids: [s4.id],
      studentScore: calculateScore(s4),
    });

    expect(s1.markdone).toBe(true);
    expect(s2.markdone).toBe(true);
    expect(s3.markdone).toBe(true);
    expect(s4.markdone).toBe(true);

    const groups = algorithm(calcscores);

    expect(groups.length).toEqual(1);

    expect(groups[0]).toEqual({
      ids: [s3.id, s1.id, s2.id],
      totalScore: calculateScore(s1) + calculateScore(s2) + calculateScore(s3),
    });
  });

  it("algorithm: Should return no teams (Two Pairs, both excluded)", () => {
    const s3: StudentInfo = {
      id: 3,
      uniId: 1,
      contestExperience: 6,
      leetcodeRating: 3000,
      codeforcesRating: 3000,
      completedCourses: [
        "intro_computing",
        "data_struct_and_algos",
        "discrete_math",
        "algorithms",
      ],
      spokenLanguages: [],
      cppExperience: Experience.none,
      cExpericence: Experience.none,
      javaExperience: Experience.none,
      pythonExperience: Experience.none,

      paired_with: 4,
      markdone: false,
    };

    const s4: StudentInfo = {
      id: 4,
      uniId: 1,
      contestExperience: 2,
      leetcodeRating: 500,
      codeforcesRating: 500,
      completedCourses: ["intro_computing"],
      spokenLanguages: [],
      cppExperience: Experience.none,
      cExpericence: Experience.none,
      javaExperience: Experience.none,
      pythonExperience: Experience.none,

      paired_with: 3,
      markdone: false,
    };

    test_studentInfo.push(s3);
    test_studentInfo.push(s4);

    s1.paired_with = 2;
    s2.paired_with = 1;

    const calcscores = getStudentScores(test_studentInfo);

    expect(calcscores.length).toEqual(2);

    expect(calcscores[0]).toEqual({
      ids: [s1.id, s2.id],
      studentScore: (calculateScore(s1) + calculateScore(s2)) / 2,
    });
    expect(calcscores[1]).toEqual({
      ids: [s3.id, s4.id],
      studentScore: (calculateScore(s3) + calculateScore(s4)) / 2,
    });

    expect(s1.markdone).toBe(true);
    expect(s2.markdone).toBe(true);
    expect(s3.markdone).toBe(true);
    expect(s4.markdone).toBe(true);

    const groups = algorithm(calcscores);

    expect(groups.length).toEqual(0);

    expect(groups).toEqual([]);
  });
});

