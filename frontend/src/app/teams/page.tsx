'use client';

import { useState } from 'react';
import pageStyles from '../styles/Page.module.css';
import TeamsList from '../components/teams/TeamsList';
import WaitingScreen from '../components/teams/WaitingScreen';

const Teams: React.FC = () => {
  const [isAllocated, setIsAllocated] = useState(false);

  return <div>
    <div className={pageStyles.screen}>
      <h1 className={pageStyles.bold}>{isAllocated ? 'All Teams' : 'Waiting for all teams to be allocated...'}</h1>
      <hr className={pageStyles.divider}/>
      {isAllocated ? <TeamsList /> : <WaitingScreen />}
    </div>
  </div>;
}

export default Teams;
