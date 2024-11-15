"use client";

import { useCallback, useEffect, useState } from "react";
import pageStyles from "@/styles/Page.module.css";
import teamStyles from "@/styles/Teams.module.css";
import TeamsList from "@/components/teams/TeamsList";
import CircularProgress from "@mui/material/CircularProgress";
import { useParams } from "next/navigation";
import axios from "axios";
import { SERVER_URL } from "@/utils/constants";
import { ContestResponse } from "@/contests/page";
import { useAuth } from "@/components/AuthProvider/AuthProvider";
import { Team } from "@/types/teams";
import AdminWaitingScreen from "@/components/waiting-screen/AdminWaitingScreen";
// const statusStrings = [
//   "Waiting for students to register...",
//   "Waiting for all teams to be allocated...",
//   "All teams",
// ];

const Teams: React.FC = () => {
  const [status, setStatus] = useState(0);
  const [contest, setContest] = useState<ContestResponse | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const { id } = useParams<{ id: string }>();
  const fetchContest = useCallback(async () => {
    try {
      const contest = await axios.get<ContestResponse>(
        `${SERVER_URL}/api/contests/${id}`,
        { withCredentials: true },
      );
      setContest(contest.data);
    } catch (err) {
      console.log(err);
    }
  }, [id]);

  const fetchTeams = useCallback(async () => {
    setStatus(1);
    try {
      const res = await axios.get<{ allTeams: Team[] }>(
        `${SERVER_URL}/api/teams/all`,
        {
          params: {
            contest: contest?.id,
          },
          withCredentials: true,
        },
      );
      const { allTeams } = res.data;
      setTeams(allTeams);
      setStatus(allTeams.length === 0 ? 0 : 2);
    } catch (error) {
      console.log(`Get teams error: ${error}`);
    }
  }, [contest?.id]);

  const {
    userSession: { role },
  } = useAuth();

  useEffect(() => {
    fetchContest();
  }, [fetchContest]);

  useEffect(() => {
    if (contest?.id) {
      fetchTeams();
    }
  }, [contest?.id, fetchTeams]);

  return (
    <>
      <h1 className={teamStyles["teams-heading"]}>
        Institution: {contest?.site}
      </h1>
      <hr className={pageStyles.divider} />
      {status === 0 && (
        <AdminWaitingScreen
          contest={contest}
          onTeamsAllocated={fetchTeams}
          role={role}
        />
      )}
      {status === 1 && (
        <div className={pageStyles["waiting-screen"]}>
          <CircularProgress />
        </div>
      )}
      {status === 2 && <TeamsList teams={teams} role={role} />}
    </>
  );
};

export default Teams;
