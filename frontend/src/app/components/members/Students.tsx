"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { SERVER_URL } from "@/utils/constants";
import pageStyles from "@/styles/Page.module.css";
import memberStyles from "@/styles/Members.module.css";
import Student, { StudentProps } from "./Student";

export interface StudentInfo {
  id: string;
  givenName: string;
  familyName: string;
  email: string;
  role: string;
  pronouns: string;
  studentId: string;
  university: string;
  team: string;
  languagesSpoken: { code: string; name: string }[];
  dietaryRequirements: string;
  photoConsent: boolean;
  tshirtSize: string | null;
}

type StudentsProps = {
  contest?: string;
};
const Students: React.FC<StudentsProps> = ({ contest }) => {
  const [students, setStudents] = useState<StudentProps[]>([]);

  const getStudents = async () => {
    try {
      const res = await axios.get<{ allUsers: StudentInfo[] }>(
        `${SERVER_URL}/api/users`,
        { withCredentials: true, params: { role: "Student", contest } },
      );
      const allStudents: StudentInfo[] = res.data.allUsers;
      const filteredInfo: StudentProps[] = allStudents.map((student) => ({
        id: student.id,
        name: student.givenName + " " + student.familyName,
        team: student.team ? student.team : "(not allocated)",
        institution: student.university,
        email: student.email,
      }));
      setStudents(filteredInfo);
    } catch (error) {
      console.log(`Get students: ${error}`);
    }
  };

  useEffect(() => {
    {
      getStudents();
    }
    // setStudents([
    //   {
    //     id: "w",
    //     name: "nadrew",
    //     team: "sub",
    //     institution: "12312",
    //     email: "andrew@gmail.com",
    //   },
    //   {
    //     id: "string",
    //     name: "aaron",
    //     team: "hub",
    //     institution: "12312",
    //     email: "ah@gmail.com",
    //   },
    //   {
    //     id: "e",
    //     name: "teehee",
    //     team: "ssfgk",
    //     institution: "12312",
    //     email: "teeheews@gmail.com",
    //   },
    // ]);
  }, []);

  return (
    <div className={memberStyles.gap}>
      <div className={`${pageStyles.bold} ${memberStyles.students}`}>
        <p>Student</p>
        <p>Team Name</p>
        <p>Institution</p>
        <p>Email</p>
      </div>
      <hr className={pageStyles.divider} />
      {students.map((student) => (
        <Student key={student.id} {...student} />
      ))}

      {/* <div className={`${memberStyles.students} ${memberStyles.space}`}>
      <p>Rachel Chen</p>
      <p>Randos</p>
      <p>UNSW Sydney</p>
      <p className={memberStyles.overflow}>z5432123@ad.unsw.edu.au</p>
    </div>
    <hr className={pageStyles.divider}/> */}
    </div>
  );
};

export default Students;
