import { Dispatch, SetStateAction, useEffect, useState } from "react";
import teamStyles from "@/styles/Teams.module.css";
import TeamCard from "./TeamCard";
import { Team } from "@/types/teams";
import { Role } from "@/types/users";

type TeamsListProps = {
  teams: Team[];
  role: Role;
  id: string;
};
const TeamsList = ({ teams, role, id }: TeamsListProps) => {
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    setCanEdit(role === "Admin" || role === "Coach");
  }, []);

  return (
    <div className={teamStyles.teams}>
      {teams.map((team) => (
        <TeamCard
          key={team.id}
          teamId={team.id}
          name={team.name}
          university={team.university}
          members={team.members}
          canEdit={canEdit}
          replacements={team.replacements}
          id={id}
        />
      ))}
    </div>
  );
};

export default TeamsList;
