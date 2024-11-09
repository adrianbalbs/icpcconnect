"use client";

import { useEffect, useState } from "react";
import pageStyles from "@/styles/Page.module.css";
import teamStyles from "@/styles/Teams.module.css";
import TeamsList from "@/components/teams/TeamsList";
import WaitingScreen from "@/components/teams/WaitingScreen";
import CircularProgress from "@mui/material/CircularProgress";
import { useParams } from "next/navigation";
import axios from "axios";
import { SERVER_URL } from "@/utils/constants";
import { ContestResponse } from "@/contests/page";
// const statusStrings = [
//   "Waiting for students to register...",
//   "Waiting for all teams to be allocated...",
//   "All teams",
// ];

const Teams: React.FC = () => {
  const [status, setStatus] = useState(0);
  const [contest, setContest] = useState<ContestResponse | null>(null);
  const { id } = useParams<{ id: string }>();

  const fetchContest = async () => {
    try {
      const contest = await axios.get<ContestResponse>(
        `${SERVER_URL}/api/contests/${id}`,
        { withCredentials: true },
      );
      setContest(contest.data);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    if (status === 1) {
      const timeout = setTimeout(() => {
        setStatus(2);
      }, 3000);

      return () => clearTimeout(timeout);
    }
    fetchContest();
  }, [status]);

  return (
    <>
      <h1 className={teamStyles["teams-heading"]}>
        Institution: {contest?.site}
      </h1>
      <hr className={pageStyles.divider} />
      {status === 0 && (
        <WaitingScreen setStatus={setStatus} contest={contest} />
      )}
      {status === 1 && (
        <div className={pageStyles["waiting-screen"]}>
          <CircularProgress />
        </div>
      )}
      {status === 2 && <TeamsList />}
    </>
  );
};

export default Teams;
