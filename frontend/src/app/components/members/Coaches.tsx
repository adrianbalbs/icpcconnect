'use client';

import axios from 'axios';
import { SERVER_URL } from '@/app/utils/constants';
import { useEffect, useState } from 'react';
import pageStyles from '../../styles/Page.module.css';
import memberStyles from '../../styles/Members.module.css';
import Staff, { StaffProps } from './Staff';

interface CoachInfo {
  id: string;
  givenName: string;
  familyName: string;
  email: string;
  role: string;
  university: string;
}

const Coaches: React.FC = () => {
  const [coaches, setCoaches] = useState<StaffProps[]>([
    {
      id: '123',
      name: 'Rebecca Liu',
      institution: 'UNSW',
      email: 'asdlakds'
    },
    {
      id: '123',
      name: 'Rachel Chen',
      institution: 'UNSW',
      email: 'asdlakds'
    }
  ]);

  // const getCoaches = async () => {
  //   try {
  //     const res = await axios.get(`${SERVER_URL}/coaches`);
  //     const allCoaches: CoachInfo[] = res.data.coaches;
  //     const filteredInfo: StaffProps[]  = allCoaches.map(coach => ({
  //       id: coach.id,
  //       name: coach.givenName + ' ' + coach.familyName,
  //       institution: coach.university,
  //       email: coach.email,
  //     }));
  //     setCoaches(filteredInfo);
  //   } catch (error) {
  //     alert(error);
  //   }
  // }

  // useEffect(() => {
  //   getCoaches();
  // }, []);

  return <div className={memberStyles.gap}>
    <div className={`${pageStyles.bold} ${memberStyles.staff}`}>
      <p>Coach</p>
      <p>Institution</p>
      <p>Email</p>
    </div>
    <hr className={pageStyles.divider}/>
    {coaches.map(coach => <Staff {...coach} />)}
  </div>
}

export default Coaches;
