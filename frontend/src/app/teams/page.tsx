'use client';

import { useEffect, useState } from 'react';
import pageStyles from '../styles/Page.module.css';
import TeamsList from '../components/teams/TeamsList';
import WaitingScreen from '../components/teams/WaitingScreen';
import CircularProgress from '@mui/material/CircularProgress';

const Teams: React.FC = () => {
  const [status, setStatus] = useState('Waiting for students to register...');

  useEffect(() => {
    if (status === 'Waiting for all teams to be allocated...') {
      const timeout = setTimeout(() => {
        setStatus('All teams');
      }, 3000);
  
      return () => clearTimeout(timeout);
    }
  }, [status]);



  return <div className={pageStyles.screen}>
    <h1 className={pageStyles.bold}>{status}</h1>
    <hr className={pageStyles.divider}/>
    {status.includes('register') && <WaitingScreen setStatus={setStatus}/>}
    {status.includes('allocated') && <div className={pageStyles['waiting-screen']}><CircularProgress /></div>}
    {status === 'All teams' && <TeamsList />}
  </div>;
}

export default Teams;
