"use client";

import { useEffect, useState } from "react";
import teamStyles from "@/styles/Teams.module.css";
import TeamCard from "./TeamCard";
import { Team } from "@/types/teams";
import { Role } from "@/types/users";

type TeamsListProps = {
  teams: Team[];
  role: Role;
};
const TeamsList: React.FC<TeamsListProps> = ({ teams, role }) => {
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    setCanEdit(role === "Admin" || role === "Coach");
  }, []);

  return (
    <div className={teamStyles.teams}>
      {teams.map((team) => (
        <TeamCard
          key={team.id}
          name={team.name}
          university={team.university}
          members={team.members}
          canEdit={canEdit}
          replacements={team.replacements.map((r) => r.leavingUserId)}
        />
      ))}
    </div>
  );
};

export default TeamsList;
