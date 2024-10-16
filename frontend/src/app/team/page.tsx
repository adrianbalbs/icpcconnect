'use client'

import { useEffect, useState } from 'react';
import pageStyles from '../styles/Page.module.css';
import Assigned from '@/components/team/Assigned';
import WaitingScreen from '@/components/teams/WaitingScreen';

const statusStrings = [
  '(Not allocated)',
  '(Awaiting allocation)',
  'team name'
];

const Team: React.FC = () => {
  const [status, setStatus] = useState(0);

  const statusToText = () => {
    return statusStrings[status];
  }

  useEffect(() => {
    // if (localStorage.getItem('team') !== null) {
    //   setAllocated(true);
    // }
  }, []);

  return (
    <div className={pageStyles.screen}>

        <h1>Team: {statusToText()}</h1>
        {status === 1 && <WaitingScreen setStatus={setStatus} />}
        {status === 2 && <Assigned />}
    </div>
  )
}

export default Team;
