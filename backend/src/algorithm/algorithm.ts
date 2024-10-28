/**
 * Team building algorithmic design
 */

import { group } from "console";
import { CreateTeamRequest } from "../schemas/team-schema.js";
import {
    AllUniIDResponse,
    AlgorithmStudentResponse,
    StudentResponse,
    AllCoursesCompleted,
    AllLanguagesSpoken,
    AlgorithmService
} from "../services/algorithm-service.js";

/** Enums **/

export enum Experience {
    none = 0,
    some = 1,
    prof = 2,
}

// MIGHT NOT BE USED
// TODO: Add other general courses
export enum Courses {
    intro_computing = 1,
    data_struct_and_algos = 2,
    algorithm_design = 3,
    prog_chal = 4,
}

/** Weighting of Specific Values for Determining Score **/

const CONTEST_WEIGHT = 5;
const LEET_WEIGHT = 4;
const CODEFORCE_WEIGHT = 4;
const COURSES_WEIGHT = 3;


/** Interfaces for Student Information and Scores **/

export interface StudentInfo {
    id: string,
    uniName: string,
    contestExperience: number,
    leetcodeRating: number, // Refer to this: https://leetcode.com/discuss/general-discussion/4409738/Contest-Ratings-and-What-Do-They-Mean/
    codeforcesRating: number, // Refer to this: https://codeforces.com/blog/entry/68288
    completedCourses : number[],
    languagesSpoken: string[],
    cppExperience: Experience,
    cExpericence: Experience,
    javaExperience: Experience,
    pythonExperience: Experience,

    paired_with: string | null,
    markdone: boolean
}

export interface StudentScore {
    ids: string[],
    studentScore: number,
    languagesSpoken: string[],
    cppExperience: Experience,
    cExpericence: Experience,
    javaExperience: Experience,
    pythonExperience: Experience,
}

export interface Group {
    ids: string[],
    totalScore: number
}

/**
 * runFullAlgorithm
 * 
 * Runs the full team creation process:
 * 1. Grabs all university IDs
 * 2. For each university it grabs all students from that university (their registration details, etc)
 * 3. Runs the getStudent scores for all students
 * 4. Runs the algorithm to create an array of team objects
 * 5. Adds those teams to the database
 */

export async function runFullAlgorithm(algorithmService: AlgorithmService): Promise<boolean> {
    const uniIds: AllUniIDResponse = await algorithmService.getAllUniversityIds()
    
    for (const uni of uniIds.allUniversityIds) {
        const studentsOfUni: AlgorithmStudentResponse = await algorithmService.getAllStudentsFromUniversity(uni.id)

        if (studentsOfUni.allStudents.length == 0) {
            continue
        }

        const studentInfo: StudentInfo[] = await convertToStudentInfo(studentsOfUni.allStudents, algorithmService)
        const studentScores: StudentScore[] = getStudentScores(studentInfo)
        const groups: Group[] = algorithm(studentScores)

        const pushedTeams: { teamId: string }[] = []
        const uniName = studentInfo[0].uniName
        let teamNum = 1
        for (const g of groups) {
            const team: CreateTeamRequest = {
                name: uniName + '-Team' + teamNum.toString(),
                university: uni.id,
                memberIds: g.ids.map(String)
            }

            teamNum++

            
            const teamId = await algorithmService.createTeam(team)
            pushedTeams.push(teamId)
        }

        if (pushedTeams.length != groups.length) {
            console.log('Something went wrong here!')
            console.log('Teams pushed to DB: ' + pushedTeams.length.toString)
            console.log('Groups formed: ' + group.length.toString())
            return false;
        }
    }

    return true;
}

/**
 * convertToStudentInfo
 * 
 * Converts a db return into the format required by the algorithm
 * 
 * @param all: StudentResponse[]
 * @returns StudentInfo[]
 */
async function convertToStudentInfo(all: StudentResponse[], algorithmService: AlgorithmService): Promise<StudentInfo[]> {
    const formattedInfo: StudentInfo[] = []
    for (const s of all) {
        const courses: AllCoursesCompleted = await algorithmService.getCoursesFromStudent(s.id)
        const languages: AllLanguagesSpoken = await algorithmService.getLanguagesFromStudent(s.id)
        formattedInfo.push({
            id: s.id,
            uniName: s.uniName,
            completedCourses : getCourses(courses),
            languagesSpoken: getLanguages(languages),
            contestExperience: s.contestExperience,
            leetcodeRating: s.leetcodeRating,
            codeforcesRating: s.codeforcesRating,
            cppExperience: convertToEnum(s.cppExperience),
            cExpericence: convertToEnum(s.cppExperience),
            javaExperience: convertToEnum(s.javaExperience),
            pythonExperience: convertToEnum(s.pythonExperience),
            paired_with: null,
            markdone: false
        })
    }
    return formattedInfo
}

/**
 * convertToEnum
 * 
 * Converts a given coding profficieny (none, some, prof) in string
 * form to it's corresponding enum value.
 * 
 * @param s: string
 * @returns Experience
 */

function convertToEnum(s: string): Experience {
    if (s == "prof") {
        return Experience.prof
    } else if (s == "some") {
        return Experience.some
    } else {
        return Experience.none
    } 
}

/**
 * getCourses
 * 
 * Extracts only the course values from a DB return
 * 
 * @param c: AllCoursesCompleted
 * @returns number[]
 */
function getCourses(c: AllCoursesCompleted): number[] {
    const courses: number[] = []
    for (const co of c.courses) {
        courses.push(co.code)
    }
    return courses
}

/**
 * getLanguages
 * 
 * Extracts only the course values from a DB return
 * 
 * @param l: AllLanguagesSpoken
 * @returns string[]
 */
function getLanguages(l: AllLanguagesSpoken): string[] {
    const languages: string[] = []
    for (const la of l.languages) {
        languages.push(la.code)
    }
    return languages
}

/**
 * GetStudentScore
 * 
 * Given a students information, it determines their weighted 
 * strength score used for team matching
 * 
 * @param s: StudentInfo
 * @returns null
 */
export function calculateScore(s: StudentInfo): number {
    let score = 0;
    score += s.contestExperience * CONTEST_WEIGHT;
    
    // Weight Leetcode Rating down from Range (Roughly Between 1 & 3)
    score += (s.leetcodeRating / 1000) * LEET_WEIGHT;

    // Weight Codeforces Rating down from Range (Roughly Between 1 & 3)
    score += (s.codeforcesRating / 1000) * CODEFORCE_WEIGHT;

    let courseScore = 0;

    for (const course of s.completedCourses) {
        courseScore += course * COURSES_WEIGHT;
    }

    return score + courseScore;
}

/**
 * getStudentScores
 * 
 * Given an array of all student information, calculates their relative strength score.
 * 
 * @param students: StudentInfo[]
 * @returns StudentScore[]
 */
export function getStudentScores(students: StudentInfo[]): StudentScore[] {
    const studentsScores: StudentScore[] = [];

    let score: StudentScore = {
        ids: ['-1'],
        studentScore: -1,
        languagesSpoken: [],
        cppExperience: Experience.none,
        cExpericence: Experience.none,
        javaExperience: Experience.none,
        pythonExperience: Experience.none
    }

    for (const s of students) {
        if (s.markdone) { continue; } // Case of it already being considered within a pair

        if (s.paired_with != null) {
            const p: StudentInfo | undefined = students.find(student => student.id == s.paired_with)
            if (p == undefined) { return [score] } // Should never happen
            score = {
                ids: [s.id, p.id],
                studentScore: (calculateScore(s) + calculateScore(p)) / 2,

                // We combine them together, we do a set operation later anyways
                languagesSpoken: s.languagesSpoken.concat(p.languagesSpoken),

                // For pairs we consider the highest experience between the two
                cppExperience: Math.max(s.cppExperience, p.cppExperience),
                cExpericence: Math.max(s.cExpericence, p.cExpericence),
                javaExperience: Math.max(s.javaExperience, p.javaExperience),
                pythonExperience: Math.max(s.pythonExperience, p.pythonExperience)
            }
            p.markdone = true; 
        } else {
            score = {
                ids: [s.id], 
                studentScore: calculateScore(s),
                languagesSpoken: s.languagesSpoken,
                cppExperience: s.cppExperience,
                cExpericence: s.cExpericence,
                javaExperience: s.javaExperience,
                pythonExperience: s.pythonExperience
            }
        }

        s.markdone = true;
        studentsScores.push(score);
    }

    return studentsScores;
}

/**
 * algorithm
 * 
 * Controls all the logic for team building / matching based on the
 * student scores.
 * 
 * @param studentsScores: StudentScore[]
 * @returns Group[]
 */
export function algorithm(studentsScores: StudentScore[]): Group[] {
    studentsScores.sort((a, b) => a.studentScore - b.studentScore)
    const groups: Group[] = [];

    while (true) {
        const group: Group = {
            ids: [],
            totalScore: 0
        }

        const stu1: StudentScore | undefined = studentsScores.pop();

        // No more students
        if (stu1 === undefined) { return groups; }

        // Stu1 = Pair
        if (stu1.ids.length == 2) {
            const stu2 = getNext(studentsScores, stu1, null, true);

            // No singular person exists to join this pair meaning only pairs are left
            if (stu2 == undefined) { return groups; }

            group.ids = stu1.ids.concat(stu2.ids);
            group.totalScore = (stu1.studentScore * 2) + stu2.studentScore;
            groups.push(group)
            continue;
        }

        const stu2: StudentScore | undefined = getNext(studentsScores, stu1, null, false);
        
        // Stu1 has no compatible teammates
        if (stu2 === undefined) { continue }

        // Stu1 = Single, Stu 2 = Pair
        if ((stu1.ids.length + stu2.ids.length) == 3) {
            group.ids = stu1.ids.concat(stu2.ids);
            group.totalScore = (stu1.studentScore * 2) + stu2.studentScore;
            groups.push(group)
            continue;
        }

        const stu3: StudentScore | undefined = getNext(studentsScores, stu1, stu2, false);

        // Stu1 with Stu2 has no compatible teammates
        if (stu3 === undefined) { continue }

        // Stu1 = Single, Stu2 = Single, Stu3 = Single
        if ((stu1.ids.length + stu2.ids.length + stu3.ids.length) == 3) {
            group.ids = stu1.ids.concat(stu2.ids).concat(stu3.ids);
            group.totalScore = stu1.studentScore + stu2.studentScore + stu3.studentScore;
            groups.push(group)
            continue;
        }
        
        // Stu1 - Single, Stu2 = Single, Stu3 = Pair
        if ((stu1.ids.length + stu2.ids.length + stu3.ids.length) == 4) {
            studentsScores.push(stu2);
            group.ids = stu1.ids.concat(stu3.ids);
            group.totalScore = stu1.studentScore + (stu3.studentScore * 2);
            groups.push(group)
            continue;
        }

        return groups;
    }
}

/**
 * getNext
 * 
 * Returns the next studentScore that is compatible with one, or both, studentScores
 * passed into this function. if needSingle is true, it returns the next studentScore
 * that is a single person (not a pair).
 * 
 * @param studentsScores StudentScore[]
 * @param s1 StudentScore
 * @param s2 StudentSCore
 * @param needSingle boolean
 * @returns StudentScore
 */
function getNext(studentsScores: StudentScore[], s1: StudentScore, s2: StudentScore | null, needSingle: boolean): StudentScore | undefined {
    if (s2 == null) {
        if (needSingle) {
            for (let i = studentsScores.length - 1; i >= 0; i--) {
                if (studentsScores[i].ids.length == 1 && isCompatible(studentsScores[i], s1)) {
                    const student: StudentScore = studentsScores[i];
                    studentsScores.splice(i, 1);
                    return student;
                }
            }
        } else {
            for (let i = studentsScores.length - 1; i >= 0; i--) {
                if (isCompatible(studentsScores[i], s1)) {
                    const student: StudentScore = studentsScores[i];
                    studentsScores.splice(i, 1);
                    return student;
                }
            }
        }
    } else {
        for (let i = studentsScores.length - 1; i >= 0; i--) {
            if (isCompatible(studentsScores[i], s1) && isCompatible(studentsScores[i], s2)) {
                const student: StudentScore = studentsScores[i];
                studentsScores.splice(i, 1);
                return student;
            }
        }
    }

    return undefined;
}

/**
 * isScoreCompatible
 * 
 * Returns whether two StudentScores have compatible coding language experience.
 * Both scores need to have at least Experience.Some or Experience.Prof in the
 * same language to be considered as 'compatible'.
 * 
 * @param s1: StudentScore
 * @param s2: StudentScore
 * @returns boolean
 */
export function isCompatible(s1: StudentScore, s2: StudentScore): boolean {
    const sameCoding = (s1.pythonExperience > 0 && s2.pythonExperience > 0)
        || (s1.javaExperience > 0 && s2.javaExperience > 0)
        || (s1.cExpericence > 0 && s2.cExpericence > 0)
        || (s1.cppExperience > 0 && s2.cppExperience > 0);

    const sameSpoken = s1.languagesSpoken.every(a => s2.languagesSpoken.includes(a));

    return sameCoding && sameSpoken;
}