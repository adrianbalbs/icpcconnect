'use client';

import axios from 'axios';
import { SERVER_URL } from '@/app/utils/constants';
import { useEffect, useState } from 'react';
import pageStyles from '../../styles/Page.module.css';
import memberStyles from '../../styles/Members.module.css';
import Student, { StudentProps } from './Student';


interface StudentInfo {
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
  const [students, setStudents] = useState<StudentProps[]>([
    {
      id: '123',
      name: 'Rachel Chen',
      team: 'Randos',
      institution: 'UNSW',
      email: 'asdlakds'
    },
    {
      id: '123',
      name: 'Rachel Chen',
      team: 'Randos',
      institution: 'UNSW',
      email: 'asdlakds'
    }
  ]);

  // const getStudents = async () => {
  //   try {
  //     const res = await axios.get(`${SERVER_URL}/students`);
  //     const allStudents: StudentInfo[] = res.data.allStudents;
  //     const filteredInfo: StudentProps[]  = allStudents.map(student => ({
  //       id: student.id,
  //       name: student.givenName + ' ' + student.familyName,
  //       team: student.team,
  //       institution: student.university,
  //       email: student.email,
  //     }));
  //     setStudents(filteredInfo);
  //   } catch (error) {
  //       alert(error);
  //   }
  // }

  // useEffect(() => {
  //   getStudents();
  // }, []);

  return <div className={memberStyles.gap}>
    <div className={`${pageStyles.bold} ${memberStyles.students}`}>
      <p>Student</p>
      <p>Team Name</p>
      <p>Institution</p>
      <p>Email</p>
    </div>
    <hr className={pageStyles.divider}/>
    {students.map(student => <Student {...student} />)}
    {/* <div className={`${memberStyles.students} ${memberStyles.space}`}>
      <p>Rachel Chen</p>
      <p>Randos</p>
      <p>UNSW Sydney</p>
      <p className={memberStyles.overflow}>z5432123@ad.unsw.edu.au</p>
    </div>
    <hr className={pageStyles.divider}/> */}
  </div>
}

export default Students;
