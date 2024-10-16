'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { SERVER_URL } from '@/utils/constants';
import pageStyles from '@/styles/Page.module.css';
import memberStyles from '@/styles/Members.module.css';
import Student, { StudentProps } from './Student';

export interface StudentInfo {
  id: string;
  givenName: string;
  familyName: string;
  email: string;
  role: string;
  pronouns: string;
  studentId: number;
  university: string;
  team: string;
}

const Students: React.FC = () => {
  const [students, setStudents] = useState<StudentProps[]>([]);

  const getStudents = async () => {
    try {
      const res = await axios.get<{ allStudents: StudentInfo[] }>(
        `${SERVER_URL}/api/students`,
      );
      const allStudents: StudentInfo[] = res.data.allStudents;
      const filteredInfo: StudentProps[] = allStudents.map((student) => ({
        id: student.id,
        name: student.givenName + ' ' + student.familyName,
        team: student.team ? student.team : '(not allocated)',
        institution: student.university,
        email: student.email,
      }));
      setStudents(filteredInfo);
    } catch (error) {
      console.log(`Get students: ${error}`);
    }
  };

  useEffect(() => {
    getStudents();
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
