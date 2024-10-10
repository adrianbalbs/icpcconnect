/**
 * Team building algorithmic design
 */

/** Enums **/

export enum Experience {
    none,
    some,
    prof
}

// MIGHT NOT BE USED
// TODO: Add other general courses
export enum Courses {
    intro_computing = 1,
    data_struct_and_algos = 2,
    discrete_math = 3,
    algorithms = 4,
    prog_chal = 5,
}

/** Weighting of Specific Values for Determining Score **/

export enum Weights {
    CONTEST_WEIGHT = 5,
    LEET_WEIGHT = 4,
    CODEFORCE_WEIGHT = 3,
    COURSES_WEIGHT = 2,
}

/** Interfaces for Student Information and Scores **/

export interface StudentInfo {
    id: number,
    uniId: number,
    contestExperience: number,
    leetcodeRating: number, // Refer to this: https://leetcode.com/discuss/general-discussion/4409738/Contest-Ratings-and-What-Do-They-Mean/
    codeforcesRating: number, // Refer to this: https://codeforces.com/blog/entry/68288
    completedCourses : string[],
    spokenLanguages: string[],
    cppExperience: Experience,
    cExpericence: Experience,
    javaExperience: Experience,
    pythonExperience: Experience,

    paired_with: number | null,
    markdone: boolean
}

export interface StudentScore {
    ids: number[],
    studentScore: number,
}

export interface Group {
    ids: number[],
    totalScore: number
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
    score += s.contestExperience * Weights.CONTEST_WEIGHT;
    
    // Weight Leetcode Rating down from Range (Roughly Between 1 & 3)
    score += (s.leetcodeRating / 1000) * Weights.LEET_WEIGHT;

    // Weight Codeforces Rating down from Range (Roughly Between 1 & 3)
    score += (s.codeforcesRating / 1000) * Weights.CODEFORCE_WEIGHT;

    let courseScore = 0;

    for (const course of s.completedCourses) {
        switch (course) {
            case 'intro_computing':
                courseScore += Courses.intro_computing;
                break;
            case 'data_struct_and_algos':
                courseScore += Courses.data_struct_and_algos;
                break;
            case 'discrete_math':
                courseScore += Courses.discrete_math;
                break;
            case 'algorithms':
                courseScore += Courses.algorithms;
                break;
            case 'prog_chal':
                courseScore += Courses.prog_chal;
                break;
        }
    }

    score += courseScore * Weights.COURSES_WEIGHT;

    return score;
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
        ids: [-42],
        studentScore: -42
    }

    for (const s of students) {
        if (s.markdone) { continue; } // Case of it already being considered within a pair

        if (s.paired_with != null) {
            const p: StudentInfo | undefined = students.find(student => student.id == s.paired_with)
            if (p == undefined) { return [score] } // Should never happen
            score = {
                ids: [s.id, p.id],
                studentScore: (calculateScore(s) + calculateScore(p)) / 2
            }
            p.markdone = true; 
        } else {
            score = {
                ids: [s.id], 
                studentScore: calculateScore(s),
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
 * @returns Groups[]
 * 
 * TODO: 
 *  - Implement logic for team building based on coding language experience
 *  - Implement logic for team building based on spoken languages
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
        if (stu1 === undefined) {
            return groups;
        }

        // Stu1 = Pair
        if (stu1.ids.length == 2) {
            const stu2 = findNextSingle(studentsScores);

            // No singular person exists to join this pair
            if (stu2.studentScore == -1) {
                continue;
            }

            group.ids = stu1.ids.concat(stu2.ids);
            group.totalScore = (stu1.studentScore * 2) + stu2.studentScore;
            groups.push(group)
            continue;
        }

        const stu2: StudentScore | undefined = studentsScores.pop();
        if (stu2 === undefined) {
            studentsScores.push(stu1);
            return groups;
        }

        // Stu1 = Single, Stu 2 = Pair
        if ((stu1.ids.length + stu2.ids.length) == 3) {
            group.ids = stu1.ids.concat(stu2.ids);
            group.totalScore = (stu1.studentScore * 2) + stu2.studentScore;
            groups.push(group)
            continue;
        }

        const stu3: StudentScore | undefined = studentsScores.pop();
        if (stu3 === undefined) {
            studentsScores.push(stu1);
            studentsScores.push(stu2); 
            return groups;
        }

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
        // Pushes the people back onto the array to see who
        // could not be assigned
        studentsScores.push(stu1);
        studentsScores.push(stu2);
        studentsScores.push(stu3);
        return groups;
    }
}


/**
 * findNextSingle
 * 
 * Finds the next singular person within the scores, removes them from the list
 * returns that students details
 * 
 * @returns StudentScore
 */
function findNextSingle(studentsScores: StudentScore[]): StudentScore {
    for (let i = studentsScores.length - 1; i >= 0; i--) {
        if (studentsScores[i].ids.length == 1) {
            const student: StudentScore = studentsScores[i];
            studentsScores.splice(i, 1);
            return student;
        }
    }

    return {
        ids: [],
        studentScore: -1,
    }
}