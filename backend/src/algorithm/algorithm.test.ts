import {
    StudentInfo,
    Experience,
    calculateScore,
    algorithm,
    getStudentScores,
    isCompatible,
    Courses,
    checkExclusions
} from "./algorithm.js"

let test_studentInfo: StudentInfo[] = [];
let s1: StudentInfo;
let s2: StudentInfo;

beforeEach(() => {
    test_studentInfo = [];

    s1 = {
        id: "1",
        uniName: "1",
        contestExperience: 6,
        leetcodeRating: 1500,
        codeforcesRating: 1500,
        completedCourses: [
            Courses.intro_computing,
            Courses.data_struct_and_algos,
            Courses.algorithm_design,
            Courses.prog_chal
        ],
        spokenLanguages: ["ab"],
        cppExperience: Experience.prof,
        cExpericence: Experience.prof,
        javaExperience: Experience.prof,
        pythonExperience: Experience.prof,
        exclusions: "",

        paired_with: null,
        markdone: false
    }

    s2 = {
        id: "2",
        uniName: "1",
        contestExperience: 6,
        leetcodeRating: 1500,
        codeforcesRating: 1500,
        completedCourses: [
            Courses.intro_computing,
            Courses.data_struct_and_algos,
            
            Courses.algorithm_design
        ],
        spokenLanguages: ["ab"],
        cppExperience: Experience.prof,
        cExpericence: Experience.prof,
        javaExperience: Experience.prof,
        pythonExperience: Experience.prof,
        exclusions: "",

        paired_with: null,
        markdone: false
    }

    test_studentInfo.push(s1);
    test_studentInfo.push(s2);
});
  
afterEach(() => {
    test_studentInfo = [];
});
  
describe("Algorithm Score Calculation Unit Tests", () => {
    it("calculateScore: Should return true (s1.score > s2.score)", async () => {
        const score1 = calculateScore(s1);
        const score2 = calculateScore(s2);

        expect(score1).toBeGreaterThan(score2);
    });

    it("checkExclusion: Tests basic exclusions", async () => {
        const names = ["Jerry Yang", "Manav Dodia"]
        const excl2 = ["Jerry"]
        const excl1 = ["Manav"]
        const excl3 = ["nav"]
        const excl4 = ["Meow"]
        const excl5 = ["12", "Python", "Jimmy"]
        const excl6 = ["12", "Python", "Jimmy", "Manav"]


        expect(checkExclusions(excl1, names)).toBe(true)
        expect(checkExclusions(excl2, names)).toBe(true)
        expect(checkExclusions(excl3, names)).toBe(true)
        expect(checkExclusions(excl4, names)).toBe(false)
        expect(checkExclusions(excl5, names)).toBe(false)
        expect(checkExclusions(excl6, names)).toBe(true)
    });

    it("getStudentScores: Should return an array of two StudentScore objects", () => {
        const calcscores = getStudentScores(test_studentInfo);

        expect(calcscores.length == 2)

        expect(calcscores[0]).toEqual({
            ids: [s1.id],
            studentScore: calculateScore(s1),
            spokenLanguages: ["ab"],
            cppExperience: Experience.prof,
            cExpericence: Experience.prof,
            javaExperience: Experience.prof,
            pythonExperience: Experience.prof
        })
        expect(calcscores[1]).toEqual({
            ids: [s2.id],
            studentScore: calculateScore(s2),
            spokenLanguages: ["ab"],
            cppExperience: Experience.prof,
            cExpericence: Experience.prof,
            javaExperience: Experience.prof,
            pythonExperience: Experience.prof
        })

        expect(s1.markdone).toBe(true)
        expect(s2.markdone).toBe(true)
    });

    it("getStudentScores: Should return an array of one StudentScore object (a pair)", () => {
        s1.paired_with = s2.id;
        s2.paired_with = s1.id;

        const calcscores = getStudentScores(test_studentInfo);

        expect(calcscores.length == 1)

        expect(calcscores[0]).toEqual({
            ids: [s1.id, s2.id],
            studentScore: (calculateScore(s1) + calculateScore(s2)) / 2,
            spokenLanguages: ["ab", "ab"],
            cppExperience: Experience.prof,
            cExpericence: Experience.prof,
            javaExperience: Experience.prof,
            pythonExperience: Experience.prof
        })

        expect(s1.markdone).toBe(true)
        expect(s2.markdone).toBe(true)
    });

    it("getStudentScores: Should return an array of two StudentScore object (a pair and a single)", () => {
        const s3: StudentInfo = {
            id: 3,
            uniName: "1",
            contestExperience: 6,
            leetcodeRating: 3000,
            codeforcesRating: 3000,
            completedCourses: [
                Courses.intro_computing,
                Courses.data_struct_and_algos,
                Courses.algorithm_design
            ],
            spokenLanguages: ["ab"],
            cppExperience: Experience.prof,
            cExpericence: Experience.prof,
            javaExperience: Experience.prof,
            pythonExperience: Experience.prof,
        exclusions: "",
        exclusions: "",
exclusions: []
    
            paired_with: s1.id,
            markdone: false
        }

        test_studentInfo.push(s3)

        s1.paired_with = s3.id;

        const calcscores = getStudentScores(test_studentInfo);

        expect(calcscores.length == 1)

        expect(calcscores[0]).toEqual({
            ids: [s1.id, s3.id],
            studentScore: (calculateScore(s1) + calculateScore(s3)) / 2,
            spokenLanguages: ["ab", "ab"],
            cppExperience: Experience.prof,
            cExpericence: Experience.prof,
            javaExperience: Experience.prof,
            pythonExperience: Experience.prof
        })
        expect(calcscores[1]).toEqual({
            ids: [s2.id],
            studentScore: calculateScore(s2),
            spokenLanguages: ["ab"],
            cppExperience: Experience.prof,
            cExpericence: Experience.prof,
            javaExperience: Experience.prof,
            pythonExperience: Experience.prof
        })

        expect(s1.markdone).toBe(true)
        expect(s2.markdone).toBe(true)
        expect(s3.markdone).toBe(true)
    });

    it("isCompatible: Should test single students compatabilities", async () => {
        const noCompat: StudentInfo = {
            id: 3,
            uniName: "1",
            contestExperience: 6,
            leetcodeRating: 3000,
            codeforcesRating: 3000,
            completedCourses: [
                Courses.intro_computing,
                Courses.data_struct_and_algos,
                Courses.algorithm_design
            ],
            spokenLanguages: ["ab"],
            cppExperience: Experience.none,
            cExpericence: Experience.none,
            javaExperience: Experience.none,
            pythonExperience: Experience.none,
    
            paired_with: null,
            markdone: false
        }

        test_studentInfo.push(noCompat);

        const CProf: StudentInfo = {
            id: 4,
            uniName: "1",
            contestExperience: 6,
            leetcodeRating: 1000,
            codeforcesRating: 3000,
            completedCourses: [
                Courses.intro_computing,
                Courses.data_struct_and_algos,
                Courses.algorithm_design
            ],
            spokenLanguages: ["ab"],
            cppExperience: Experience.none,
            cExpericence: Experience.prof,
            javaExperience: Experience.none,
            pythonExperience: Experience.none,
    
            paired_with: null,
            markdone: false
        }

        test_studentInfo.push(CProf);

        const JavaSome: StudentInfo = {
            id: 5,
            uniName: "1",
            contestExperience: 6,
            leetcodeRating: 1000,
            codeforcesRating: 3000,
            completedCourses: [
                Courses.intro_computing,
                Courses.data_struct_and_algos,
                Courses.algorithm_design
            ],
            spokenLanguages: ["ab"],
            cppExperience: Experience.none,
            cExpericence: Experience.none,
            javaExperience: Experience.some,
            pythonExperience: Experience.none,
    
            paired_with: null,
            markdone: false
        }

        test_studentInfo.push(JavaSome);

        const calcscores = getStudentScores(test_studentInfo);

        expect(isCompatible(calcscores[0], calcscores[1])).toBe(true);
        expect(isCompatible(calcscores[0], calcscores[2])).toBe(false);
        expect(isCompatible(calcscores[0], calcscores[3])).toBe(true);
        expect(isCompatible(calcscores[0], calcscores[4])).toBe(true);
        expect(isCompatible(calcscores[3], calcscores[4])).toBe(false);
    });

    it("isCompatible: Should test pair students compatabilities", async () => {
        s1.paired_with = s2.id;
        s2.paired_with = s1.id;

        const noCompat: StudentInfo = {
            id: 3,
            uniName: "1",
            contestExperience: 6,
            leetcodeRating: 3000,
            codeforcesRating: 3000,
            completedCourses: [
                Courses.intro_computing,
                Courses.data_struct_and_algos,
                Courses.algorithm_design
            ],
            spokenLanguages: ["ab"],
            cppExperience: Experience.none,
            cExpericence: Experience.none,
            javaExperience: Experience.none,
            pythonExperience: Experience.none,
    
            paired_with: 4,
            markdone: false
        }

        test_studentInfo.push(noCompat);

        const CProf: StudentInfo = {
            id: 4,
            uniName: "1",
            contestExperience: 6,
            leetcodeRating: 1000,
            codeforcesRating: 3000,
            completedCourses: [
                Courses.intro_computing,
                Courses.data_struct_and_algos,
                Courses.algorithm_design
            ],
            spokenLanguages: ["ab"],
            cppExperience: Experience.none,
            cExpericence: Experience.prof,
            javaExperience: Experience.none,
            pythonExperience: Experience.none,
    
            paired_with: 3,
            markdone: false
        }

        test_studentInfo.push(CProf);

        const calcscores = getStudentScores(test_studentInfo);

        expect(isCompatible(calcscores[0], calcscores[1])).toBe(true);
    });

    it("isCompatible: Test language compatabilities", async () => {
        const otherLang: StudentInfo = {
            id: 4,
            uniName: "1",
            contestExperience: 6,
            leetcodeRating: 1000,
            codeforcesRating: 3000,
            completedCourses: [
                Courses.intro_computing,
                Courses.data_struct_and_algos,
                Courses.algorithm_design
            ],
            spokenLanguages: ["aa"],
            cppExperience: Experience.prof,
            cExpericence: Experience.prof,
            javaExperience: Experience.prof,
            pythonExperience: Experience.prof,
        exclusions: "",
        exclusions: "",
exclusions: []
    
            paired_with: null,
            markdone: false
        }
        
        test_studentInfo.push(otherLang)

        const bothLang: StudentInfo = {
            id: 4,
            uniName: "1",
            contestExperience: 6,
            leetcodeRating: 1000,
            codeforcesRating: 3000,
            completedCourses: [
                Courses.intro_computing,
                Courses.data_struct_and_algos,
                Courses.algorithm_design
            ],
            spokenLanguages: ["ab", "aa"],
            cppExperience: Experience.prof,
            cExpericence: Experience.prof,
            javaExperience: Experience.prof,
            pythonExperience: Experience.prof,
        exclusions: "",
        exclusions: "",
exclusions: []
    
            paired_with: null,
            markdone: false
        }
        
        test_studentInfo.push(bothLang)

        const calcscores = getStudentScores(test_studentInfo);

        expect(isCompatible(calcscores[0], calcscores[1])).toBe(true);
        expect(isCompatible(calcscores[0], calcscores[2])).toBe(false);
        expect(isCompatible(calcscores[0], calcscores[3])).toBe(true);
        expect(isCompatible(calcscores[2], calcscores[3])).toBe(true);
    });

    it("algorithm: Should return a singular team (Pair and Single)", () => {
        const noCompat: StudentInfo = {
            id: 3,
            uniName: "1",
            contestExperience: 6,
            leetcodeRating: 3000,
            codeforcesRating: 3000,
            completedCourses: [
                Courses.intro_computing,
                Courses.data_struct_and_algos,
                Courses.algorithm_design
            ],
            spokenLanguages: ["ab"],
            cppExperience: Experience.none,
            cExpericence: Experience.none,
            javaExperience: Experience.none,
            pythonExperience: Experience.none,
    
            paired_with: 4,
            markdone: false
        }

        test_studentInfo.push(noCompat);

        const CProf: StudentInfo = {
            id: 4,
            uniName: "1",
            contestExperience: 6,
            leetcodeRating: 1000,
            codeforcesRating: 3000,
            completedCourses: [
                Courses.intro_computing,
                Courses.data_struct_and_algos,
                Courses.algorithm_design
            ],
            spokenLanguages: ["ab"],
            cppExperience: Experience.none,
            cExpericence: Experience.prof,
            javaExperience: Experience.none,
            pythonExperience: Experience.none,
    
            paired_with: 3,
            markdone: false
        }

        test_studentInfo.push(CProf);

        const calcscores = getStudentScores(test_studentInfo);

        expect(isCompatible(calcscores[0], calcscores[1])).toBe(true);
    });

    it("isCompatible: Test language compatabilities", async () => {
        const otherLang: StudentInfo = {
            id: 4,
            uniName: "1",
            contestExperience: 6,
            leetcodeRating: 1000,
            codeforcesRating: 3000,
            completedCourses: [
                Courses.intro_computing,
                Courses.data_struct_and_algos,
                Courses.algorithm_design
            ],
            spokenLanguages: ["aa"],
            cppExperience: Experience.prof,
            cExpericence: Experience.prof,
            javaExperience: Experience.prof,
            pythonExperience: Experience.prof,
        exclusions: "",
        exclusions: "",
exclusions: []
    
            paired_with: null,
            markdone: false
        }
        
        test_studentInfo.push(otherLang)

        const bothLang: StudentInfo = {
            id: 4,
            uniName: "1",
            contestExperience: 6,
            leetcodeRating: 1000,
            codeforcesRating: 3000,
            completedCourses: [
                Courses.intro_computing,
                Courses.data_struct_and_algos,
                Courses.algorithm_design
            ],
            spokenLanguages: ["ab", "aa"],
            cppExperience: Experience.prof,
            cExpericence: Experience.prof,
            javaExperience: Experience.prof,
            pythonExperience: Experience.prof,
        exclusions: "",
        exclusions: "",
exclusions: []
    
            paired_with: null,
            markdone: false
        }
        
        test_studentInfo.push(bothLang)

        const calcscores = getStudentScores(test_studentInfo);

        expect(isCompatible(calcscores[0], calcscores[1])).toBe(true);
        expect(isCompatible(calcscores[0], calcscores[2])).toBe(false);
        expect(isCompatible(calcscores[0], calcscores[3])).toBe(true);
        expect(isCompatible(calcscores[2], calcscores[3])).toBe(true);
    });

    it("algorithm: Should return a singular team (Pair and Single)", () => {
        const noCompat: StudentInfo = {
            id: 3,
            uniName: "1",
            contestExperience: 6,
            leetcodeRating: 3000,
            codeforcesRating: 3000,
            completedCourses: [
                Courses.intro_computing,
                Courses.data_struct_and_algos,
                Courses.algorithm_design
            ],
            spokenLanguages: ["ab"],
            cppExperience: Experience.prof,
            cExpericence: Experience.prof,
            javaExperience: Experience.prof,
            pythonExperience: Experience.prof,
        exclusions: "",
        exclusions: "",
exclusions: []
    
            paired_with: 4,
            markdone: false
        }

        test_studentInfo.push(noCompat);

        const CProf: StudentInfo = {
            id: 4,
            uniName: "1",
            contestExperience: 6,
            leetcodeRating: 1000,
            codeforcesRating: 3000,
            completedCourses: [
                Courses.intro_computing,
                Courses.data_struct_and_algos,
                Courses.algorithm_design
            ],
            spokenLanguages: ["ab"],
            cppExperience: Experience.none,
            cExpericence: Experience.prof,
            javaExperience: Experience.none,
            pythonExperience: Experience.none,
    
            paired_with: 3,
            markdone: false
        }

        test_studentInfo.push(CProf);

        const calcscores = getStudentScores(test_studentInfo);

        expect(isCompatible(calcscores[0], calcscores[1])).toBe(true);
    });

    it("isCompatible: Test language compatabilities", async () => {
        const otherLang: StudentInfo = {
            id: 4,
            uniName: "1",
            contestExperience: 6,
            leetcodeRating: 1000,
            codeforcesRating: 3000,
            completedCourses: [
                Courses.intro_computing,
                Courses.data_struct_and_algos,
                Courses.algorithm_design
            ],
            spokenLanguages: ["aa"],
            cppExperience: Experience.prof,
            cExpericence: Experience.prof,
            javaExperience: Experience.prof,
            pythonExperience: Experience.prof,
        exclusions: "",
        exclusions: "",
exclusions: []
    
            paired_with: null,
            markdone: false
        }
        
        test_studentInfo.push(otherLang)

        const bothLang: StudentInfo = {
            id: 4,
            uniName: "1",
            contestExperience: 6,
            leetcodeRating: 1000,
            codeforcesRating: 3000,
            completedCourses: [
                Courses.intro_computing,
                Courses.data_struct_and_algos,
                Courses.algorithm_design
            ],
            spokenLanguages: ["ab", "aa"],
            cppExperience: Experience.prof,
            cExpericence: Experience.prof,
            javaExperience: Experience.prof,
            pythonExperience: Experience.prof,
        exclusions: "",
        exclusions: "",
exclusions: []
    
            paired_with: null,
            markdone: false
        }
        
        test_studentInfo.push(bothLang)

        const calcscores = getStudentScores(test_studentInfo);

        expect(isCompatible(calcscores[0], calcscores[1])).toBe(true);
        expect(isCompatible(calcscores[0], calcscores[2])).toBe(false);
        expect(isCompatible(calcscores[0], calcscores[3])).toBe(true);
        expect(isCompatible(calcscores[2], calcscores[3])).toBe(true);
    });

    it("algorithm: Should return a singular team (Pair and Single)", () => {
        const noCompat: StudentInfo = {
            id: 3,
            uniName: "1",
            contestExperience: 6,
            leetcodeRating: 3000,
            codeforcesRating: 3000,
            completedCourses: [
                Courses.intro_computing,
                Courses.data_struct_and_algos,
                Courses.algorithm_design
            ],
            spokenLanguages: ["ab"],
            cppExperience: Experience.none,
            cExpericence: Experience.none,
            javaExperience: Experience.none,
            pythonExperience: Experience.none,
    
            paired_with: 4,
            markdone: false
        }

        test_studentInfo.push(noCompat);

        const CProf: StudentInfo = {
            id: 4,
            uniName: "1",
            contestExperience: 6,
            leetcodeRating: 1000,
            codeforcesRating: 3000,
            completedCourses: [
                Courses.intro_computing,
                Courses.data_struct_and_algos,
                Courses.algorithm_design
            ],
            spokenLanguages: ["ab"],
            cppExperience: Experience.none,
            cExpericence: Experience.prof,
            javaExperience: Experience.none,
            pythonExperience: Experience.none,
    
            paired_with: 3,
            markdone: false
        }

        test_studentInfo.push(CProf);

        const calcscores = getStudentScores(test_studentInfo);

        expect(isCompatible(calcscores[0], calcscores[1])).toBe(true);
    });

    it("algorithm: Should return a singular team (Pair and Single)", () => {
        const s3: StudentInfo = {
            id: 3,
            uniName: "1",
            contestExperience: 6,
            leetcodeRating: 3000,
            codeforcesRating: 3000,
            completedCourses: [
                Courses.intro_computing,
                Courses.data_struct_and_algos,
                Courses.algorithm_design
            ],
            spokenLanguages: ["ab"],
            cppExperience: Experience.prof,
            cExpericence: Experience.prof,
            javaExperience: Experience.prof,
            pythonExperience: Experience.prof,
        exclusions: "",
        exclusions: "",
exclusions: []
    
            paired_with: s1.id,
            markdone: false
        }

        test_studentInfo.push(s3)

        s1.paired_with = s3.id;

        const calcscores = getStudentScores(test_studentInfo);

        expect(calcscores.length).toEqual(2)

        expect(calcscores[0]).toEqual({
            ids: [s1.id, s3.id],
            studentScore: (calculateScore(s1) + calculateScore(s3)) / 2,
            spokenLanguages: ["ab", "ab"],
            cppExperience: Experience.prof,
            cExpericence: Experience.prof,
            javaExperience: Experience.prof,
            pythonExperience: Experience.prof
        })
        expect(calcscores[1]).toEqual({
            ids: [s2.id],
            studentScore: calculateScore(s2),
            spokenLanguages: ["ab"],
            cppExperience: Experience.prof,
            cExpericence: Experience.prof,
            javaExperience: Experience.prof,
            pythonExperience: Experience.prof
        })

        expect(s1.markdone).toBe(true)
        expect(s2.markdone).toBe(true)
        expect(s3.markdone).toBe(true)

        const groups = algorithm(calcscores)

        expect(groups.length).toEqual(1)

        expect(groups[0].ids.sort()).toEqual([s1.id, s2.id, s3.id].sort())
        expect(groups[0].totalScore).toEqual(calculateScore(s1) + calculateScore(s2) + calculateScore(s3))
    });

    it("algorithm: Should return a singular team (Three Singles)", () => {
        const s3: StudentInfo = {
            id: 3,
            uniName: "1",
            contestExperience: 6,
            leetcodeRating: 3000,
            codeforcesRating: 3000,
            completedCourses: [
                Courses.intro_computing,
                Courses.data_struct_and_algos,
                Courses.algorithm_design
            ],
            spokenLanguages: ["ab"],
            cppExperience: Experience.prof,
            cExpericence: Experience.prof,
            javaExperience: Experience.prof,
            pythonExperience: Experience.prof,
        exclusions: "",
        exclusions: "",
exclusions: []
    
            paired_with: null,
            markdone: false
        }

        test_studentInfo.push(s3)

        const calcscores = getStudentScores(test_studentInfo);

        expect(calcscores.length).toEqual(3)

        expect(calcscores[0]).toEqual({
            ids: [s1.id],
            studentScore: calculateScore(s1),
            spokenLanguages: ["ab"],
            cppExperience: Experience.prof,
            cExpericence: Experience.prof,
            javaExperience: Experience.prof,
            pythonExperience: Experience.prof
        })
        expect(calcscores[1]).toEqual({
            ids: [s2.id],
            studentScore: calculateScore(s2),
            spokenLanguages: ["ab"],
            cppExperience: Experience.prof,
            cExpericence: Experience.prof,
            javaExperience: Experience.prof,
            pythonExperience: Experience.prof
        })
        expect(calcscores[2]).toEqual({
            ids: [s3.id],
            studentScore: calculateScore(s3),
            spokenLanguages: ["ab"],
            cppExperience: Experience.prof,
            cExpericence: Experience.prof,
            javaExperience: Experience.prof,
            pythonExperience: Experience.prof
        })

        expect(s1.markdone).toBe(true)
        expect(s2.markdone).toBe(true)
        expect(s3.markdone).toBe(true)

        const groups = algorithm(calcscores)

        expect(groups.length).toEqual(1)

        expect(groups[0].ids.sort()).toEqual([s1.id, s2.id, s3.id].sort())
        expect(groups[0].totalScore).toEqual(calculateScore(s1) + calculateScore(s2) + calculateScore(s3))
    });

    it("algorithm: Should return a singular team (Four Singles (1 Excluded))", () => {
        const s3: StudentInfo = {
            id: 3,
            uniName: "1",
            contestExperience: 6,
            leetcodeRating: 3000,
            codeforcesRating: 3000,
            completedCourses: [
                Courses.intro_computing,
                Courses.data_struct_and_algos,
                Courses.algorithm_design
            ],
            spokenLanguages: ["ab"],
            cppExperience: Experience.prof,
            cExpericence: Experience.prof,
            javaExperience: Experience.prof,
            pythonExperience: Experience.prof,
        exclusions: "",
        exclusions: "",
exclusions: []
    
            paired_with: null,
            markdone: false
        }

        const s4: StudentInfo = {
            id: 4,
            uniName: "1",
            contestExperience: 2,
            leetcodeRating: 500,
            codeforcesRating: 500,
            completedCourses: [
                Courses.intro_computing
            ],
            spokenLanguages: ["ab"],
            cppExperience: Experience.prof,
            cExpericence: Experience.prof,
            javaExperience: Experience.prof,
            pythonExperience: Experience.prof,
        exclusions: "",
        exclusions: "",
exclusions: []
    
            paired_with: null,
            markdone: false
        }

        test_studentInfo.push(s3)
        test_studentInfo.push(s4)

        const calcscores = getStudentScores(test_studentInfo);

        expect(calcscores.length).toEqual(4)

        expect(calcscores[0]).toEqual({
            ids: [s1.id],
            studentScore: calculateScore(s1),
            spokenLanguages: ["ab"],
            cppExperience: Experience.prof,
            cExpericence: Experience.prof,
            javaExperience: Experience.prof,
            pythonExperience: Experience.prof
        })
        expect(calcscores[1]).toEqual({
            ids: [s2.id],
            studentScore: calculateScore(s2),
            spokenLanguages: ["ab"],
            cppExperience: Experience.prof,
            cExpericence: Experience.prof,
            javaExperience: Experience.prof,
            pythonExperience: Experience.prof
        })
        expect(calcscores[2]).toEqual({
            ids: [s3.id],
            studentScore: calculateScore(s3),
            spokenLanguages: ["ab"],
            cppExperience: Experience.prof,
            cExpericence: Experience.prof,
            javaExperience: Experience.prof,
            pythonExperience: Experience.prof
        })
        expect(calcscores[3]).toEqual({
            ids: [s4.id],
            studentScore: calculateScore(s4),
            spokenLanguages: ["ab"],
            cppExperience: Experience.prof,
            cExpericence: Experience.prof,
            javaExperience: Experience.prof,
            pythonExperience: Experience.prof
        })

        expect(s1.markdone).toBe(true)
        expect(s2.markdone).toBe(true)
        expect(s3.markdone).toBe(true)
        expect(s4.markdone).toBe(true)

        const groups = algorithm(calcscores)

        expect(groups.length).toEqual(1)

        expect(groups[0].ids.sort()).toEqual([s1.id, s2.id, s3.id].sort())
        expect(groups[0].totalScore).toEqual(calculateScore(s1) + calculateScore(s2) + calculateScore(s3))
    });

    it("algorithm: Should return no teams (Two Pairs, both excluded)", () => {
        const s3: StudentInfo = {
            id: 3,
            uniName: "1",
            contestExperience: 6,
            leetcodeRating: 3000,
            codeforcesRating: 3000,
            completedCourses: [
                Courses.intro_computing,
                Courses.data_struct_and_algos,
                Courses.algorithm_design
            ],
            spokenLanguages: ["ab"],
            cppExperience: Experience.prof,
            cExpericence: Experience.prof,
            javaExperience: Experience.prof,
            pythonExperience: Experience.prof,
            exclusions: "",
    
            paired_with: "4",
            markdone: false
        }

        const s4: StudentInfo = {
            id: "4",
            uniName: "1",
            contestExperience: 2,
            leetcodeRating: 500,
            codeforcesRating: 500,
            completedCourses: [
                Courses.intro_computing
            ],
            spokenLanguages: ["ab"],
            cppExperience: Experience.prof,
            cExpericence: Experience.prof,
            javaExperience: Experience.prof,
            pythonExperience: Experience.prof,
            exclusions: "",
    
            paired_with: "3",
            markdone: false
        }

        test_studentInfo.push(s3)
        test_studentInfo.push(s4)

        s1.paired_with = 2;
        s2.paired_with = 1;

        const calcscores = getStudentScores(test_studentInfo);

        expect(calcscores.length).toEqual(2)

        expect(calcscores[0]).toEqual({
            ids: [s1.id, s2.id],
            studentScore: (calculateScore(s1) + calculateScore(s2)) / 2,
            spokenLanguages: ["ab", "ab"],
            cppExperience: Experience.prof,
            cExpericence: Experience.prof,
            javaExperience: Experience.prof,
            pythonExperience: Experience.prof
        })
        expect(calcscores[1]).toEqual({
            ids: [s3.id, s4.id],
            studentScore: (calculateScore(s3) + calculateScore(s4)) / 2,
            spokenLanguages: ["ab", "ab"],
            cppExperience: Experience.prof,
            cExpericence: Experience.prof,
            javaExperience: Experience.prof,
            pythonExperience: Experience.prof
        })

        expect(s1.markdone).toBe(true)
        expect(s2.markdone).toBe(true)
        expect(s3.markdone).toBe(true)
        expect(s4.markdone).toBe(true)

        const groups = algorithm(calcscores)

        expect(groups.length).toEqual(0)

        expect(groups).toEqual([])
    });
})
