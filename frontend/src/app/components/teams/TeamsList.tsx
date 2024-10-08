// import axios from 'axios';
// import { SERVER_URL } from '../utils/constants';
import teamStyles from '../../styles/Teams.module.css';
import TeamCard from './TeamCard';

const TeamsList: React.FC = () => {
  // const getTeams = async () => {
  //   const res = await axios.get(`${SERVER_URL}/teams/all`);

  // }
  return <div className={teamStyles.teams}>
    <TeamCard name="Tomato Factory" institution="UNSW" members={["Adrian", "Kobe", "Jerry"]} canEdit={true} />
    <TeamCard name="Tomato Factory" institution="UNSW" members={["Adrian", "Kobe", "Jerry"]} canEdit={false} />
    <TeamCard name="Tomato Factory" institution="UNSW" members={["Adrian", "Kobe", "Jerry"]} canEdit={false} />
  </div>
}

export default TeamsList;
