'use client'

import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { SERVER_URL } from '@/utils/constants';
import { getInfo } from '@/utils/profileInfo';
import pageStyles from '@/styles/Page.module.css';
import teamStyles from '@/styles/Teams.module.css';
import Assigned from '@/components/team/Assigned';
import WaitingScreen from '@/components/teams/WaitingScreen';
import TeamRegistration from '@/components/team/TeamRegistration';
import { MemberProps } from '@/components/team/Member';

interface TeamInfo {
  id: string;
  name: string;
  members: MemberProps[];
}

const statusStrings = ['(Not allocated)', '(Awaiting allocation)'];

const Team: React.FC = () => {
  const [status, setStatus] = useState(0);
  const [uni, setUni] = useState('');
  const [team, setTeam] = useState<TeamInfo>({
    id: '',
    name: 'Tomato Factory',
    members: []
  });

  const getTeam = async () => {
    try {
      const id = localStorage.getItem('id');
      const studentData = await getInfo(id);
      if (studentData) {
        setUni(studentData.university);
      }

      // const res = await axios.get(`${SERVER_URL}/api/teams/student/${id}`);
      // setTeam(res.data);
      setTeam({
        id: '',
        name: 'Tomato Factory',
        members: []
      });
    } catch (error) {
      console.log(`Student get team error: ${error}`)
    }
  }

  useEffect(() => {
    getTeam();
  }, []);

  return (
    <div className={pageStyles.screen}>
      <h1 className={teamStyles['team-heading']}>
        Team:
        {status === 2 && <span> {team.name}</span>}
        {status !== 2 && <span className={teamStyles.status}> {statusStrings[status]}</span>}
      </h1>
      <p className={teamStyles.university}>{uni}</p>
      {status !== 2 && <hr className={pageStyles.divider}/>}
      {status === 0 && <TeamRegistration />}
      {status === 1 && <WaitingScreen setStatus={setStatus} />}
      {status === 2 && <Assigned members={team.members} />}
    </div>
  )
}

export default Team;
