/**
 * Team building algorithmic design
 */

import {
    AlgorithmService
} from "../services/algorithm-service.js"

/** Enums **/

enum Experience {
    none,
    some,
    prof
}

/** Weighting of Specific Values for Determining Score **/

const CONTEST_WEIGHT = 5;
const LEET_WEIGHT = 2.5;
const CODEFORCE_WEIGHT = 2.5;
const COURSES_WEIGHT = 1.5;

/** Interfaces for Student Information and Scores **/

interface StudentInfo {
    id: number,
    uniId: number,
    contestExperience: number,
    leetcodeRating: number, // Refer to this: https://leetcode.com/discuss/general-discussion/4409738/Contest-Ratings-and-What-Do-They-Mean/
    codeforcesRating: number, // Refer to this: https://codeforces.com/blog/entry/68288
    completedCourses : String[],
    spokenLanguages: String[],
    cppExperience: Experience,
    cExpericence: Experience,
    javaExperience: Experience,
    pythonExperience: Experience
}

interface StudentScore {
    ids: number[],
    studentScore: number,
}

interface Group {
    ids: number[],
    totalScore: number
}

function GetStudentScore(s: StudentInfo) {
    let score = 0;
    score += s.contestExperience * CONTEST_WEIGHT;
    
    // Weight Leetcode Rating down from Range
    score += (s.leetcodeRating / 1000) * LEET_WEIGHT;

    // Weight Codeforces Rating down from Range
    score += (s.codeforcesRating / 1000) * CODEFORCE_WEIGHT;

    // Need to handle logic for courses
}

let studentsScores: StudentScore[] = [];
let groups: Group[] = [];

function algorithm() {
    while (true) {
        let group: Group = {
            ids: [],
            totalScore: 0
        }

        let stu1: StudentScore | undefined = studentsScores.pop();
        if (stu1 === undefined) { break; }

        // Stu1 = Pair
        if (stu1.ids.length == 2) {
            let stu2 = findNextSingle();

            // No singular person exists to join this pair
            if (stu2.studentScore == -1) {
                continue;
            }

            group.ids = stu1.ids.concat(stu2.ids);
            group.totalScore = (stu1.studentScore * 2) + stu2.studentScore;
            groups.push(group)
            continue;
        }

        let stu2: StudentScore | undefined = studentsScores.pop();
        if (stu2 === undefined) { studentsScores.push(stu1); break; }

        // Stu1 = Single, Stu 2 = Pair
        if ((stu1.ids.length + stu2.ids.length) == 3) {
            group.ids = stu1.ids.concat(stu2.ids);
            group.totalScore = (stu1.studentScore * 2) + stu2.studentScore;
            groups.push(group)
            continue;
        }

        let stu3: StudentScore | undefined = studentsScores.pop();
        if (stu3 === undefined) { studentsScores.push(stu1); studentsScores.push(stu2); break; }

        // Stu1 = Single, Stu2 = Single, Stu3 = Single
        if ((stu1.ids.length + stu2.ids.length + stu3.ids.length) == 3) {
            group.ids = stu1.ids.concat(stu2.ids).concat(stu3.ids);
            group.totalScore = stu1.studentScore + stu2.studentScore + stu3.studentScore;
            groups.push(group)
            continue;
        }
        
        if ((stu1.ids.length + stu2.ids.length + stu3.ids.length) == 4) {
            studentsScores.push(stu2);
            group.ids = stu1.ids.concat(stu3.ids);
            group.totalScore = stu1.studentScore + (stu3.studentScore * 2);
            groups.push(group)
            continue;
        }

        // All cases exhausted, no other teams could be made
        studentsScores.push(stu1);
        studentsScores.push(stu2);
        studentsScores.push(stu3);
        break;
    }
}

function findNextSingle(): StudentScore {
    for (let i = studentsScores.length - 1; i >= 0; i--) {
        if (studentsScores[i].ids.length == 1) {
            let student: StudentScore = studentsScores[i];
            studentsScores.splice(i, 1);
            return student;
        }
    }

    return {
        ids: [],
        studentScore: -1,
    }
}


/** TESTING FUNCTIONS **/

runTest();

function runTest() {
    let numSingle: number = getRandomArbitrary(50, 169);
    let numPair: number = getRandomArbitrary(numSingle, numSingle + 69);

    // Create singular students
    for (let i = 0; i < numSingle; i++) {
        let students: number[] = []
        students.push(i)
        let score: StudentScore = {
            ids: students,
            studentScore: Math.random() * 1000,
        }
        studentsScores.push(score);
    }

    // Create pairs of students
    for (let j = 101; j < numPair; j = j + 2) {
        let students: number[] = []
        students.push(j)
        students.push(j+1)
        let score: StudentScore = {
            ids: students,
            studentScore: ((Math.random() * 1000) + (Math.random() * 1000)) / 2,
        }
        studentsScores.push(score);
    }

    studentsScores.sort((a, b) => a.studentScore - b.studentScore);

    algorithm();

    // Print leftover students or pairs (cannot have both)
    console.log("Leftover Students:\n")
    console.log(studentsScores);
    console.log("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=")

    // Print all formed teams
    console.log("Formed Teams:\n")
    console.log(groups);
}

function getRandomArbitrary(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

/** END TESTING FUNCTIONS **/
