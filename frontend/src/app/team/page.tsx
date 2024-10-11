import { useEffect, useState } from 'react';
import pageStyles from '../styles/Page.module.css';

const Team: React.FC = () => {
  const [team, setTeam] = useState();
  
  useEffect(() => {
    
  }, []);

  return <div className={pageStyles.screen}>
    <h1>Team: </h1>
 </div>;
}

export default Team;