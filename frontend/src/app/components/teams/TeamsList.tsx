import { useEffect, useState } from "react";
import teamStyles from "@/styles/Teams.module.css";
import TeamCard from "./TeamCard";
import { Team } from "@/types/teams";
import { Role } from "@/types/users";

type TeamsListProps = {
  teams: Team[];
  role: Role;
  id: string;
  fetchTeams: () => Promise<void>;
};

/**
 * Team List component
 * - renders a list of Team Cards
 */
const TeamsList = ({ teams, role, id, fetchTeams }: TeamsListProps) => {
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    setCanEdit(role === "Admin" || role === "Coach");
  }, []);

  return (
    <div className={teamStyles.teams}>
      {teams.map((team) => (
        <TeamCard
          key={team.id}
          team={team}
          canEdit={canEdit}
          replacements={team.replacements}
          id={id}
          fetchTeams={fetchTeams}
        />
      ))}
    </div>
  );
};

export default TeamsList;
