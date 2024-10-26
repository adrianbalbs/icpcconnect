import axios from "axios";
import { useEffect } from "react";
import { SERVER_URL } from "@/utils/constants";
import teamStyles from "@/styles/Teams.module.css";
import TeamCard from "./TeamCard";

// interface Team {
//   id: string;
//   name: string;
//   university: string;
//   members: Array<string>;
// }

const TeamsList: React.FC = () => {
  // const [teams, setTeams] = useState<Array<Team>>([]);
  // const [canEdit, setCanEdit] = useState(false);

  const getTeams = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/teams/all`);
      const data = res.data;
      console.log(data);
      // setTeams(data);
    } catch (error) {
      console.log(`Get teams error: ${error}`);
    }
  };

  useEffect(() => {
    getTeams();
    // setCanEdit(localStorage.getItem('role') === 'admin' || localStorage.getItem('role') === 'coach');
  }, []);

  return (
    <div className={teamStyles.teams}>
      <TeamCard
        name="Tomato Factory 1"
        university="UNSW"
        members={["Adrian 1", "Kobe 1", "Jerry 1"]}
        canEdit={false}
      />
      <TeamCard
        name="Tomato Factory 2"
        university="UNSW"
        members={["Adrian 2", "Rachel Chen", "Jerry 2"]}
        canEdit={false}
      />
      <TeamCard
        name="Tomato Factory 3"
        university="UNSW"
        members={["Adrian 3", "Kobe 3", "Jerry 3"]}
        canEdit={false}
      />
      {/* {teams.map((team) => <TeamCard key={team.id} {...team} canEdit={canEdit} />)} */}
    </div>
  );
};

export default TeamsList;
