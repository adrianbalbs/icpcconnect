'use client';

import { useEffect, useState } from 'react';
import pageStyles from '@/styles/Page.module.css';
import teamStyles from '@/styles/Teams.module.css';
import TeamsList from '@/components/teams/TeamsList';
import WaitingScreen from '@/components/teams/WaitingScreen';
import CircularProgress from '@mui/material/CircularProgress';

const statusStrings = [
  'Waiting for students to register...',
  'Waiting for all teams to be allocated...',
  'All teams'
];

const Teams: React.FC = () => {
  const [status, setStatus] = useState(0);

  useEffect(() => {
    if (status === 1) {
      const timeout = setTimeout(() => {
        setStatus(2);
      }, 3000);
  
      return () => clearTimeout(timeout);
    }
  }, [status]);



  return <div className={pageStyles.screen}>
    <h1 className={teamStyles['teams-heading']}>{statusStrings[status]}</h1>
    <hr className={pageStyles.divider}/>
    {status === 0 && <WaitingScreen setStatus={setStatus}/>}
    {status === 1 && <div className={pageStyles['waiting-screen']}><CircularProgress /></div>}
    {status === 2 && <TeamsList />}
  </div>;
}

export default Teams;
