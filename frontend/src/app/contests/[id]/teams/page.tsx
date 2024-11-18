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
import { useAuth } from "@/components/context-provider/AuthProvider";
import { Team } from "@/types/teams";
import AdminWaitingScreen from "@/components/waiting-screen/AdminWaitingScreen";
import SortBy from "@/components/utils/SortBy";
import { getInfo } from "@/utils/profileInfo";
import { Typography } from "@mui/material";
import { siteToUniversity } from "@/utils/university";

/**
 * Teams Page - /contests/:id/teams
 * - student has no access
 * - coach: views all teams of their university - has editing rights
 * - site coordinators: views all teams of their site - has viewing rights
 * - admin: views all teams in contest - has editing rights
 */
const Teams: React.FC = () => {
  // Status Key
  // 0: before early bird registration closes
  // 1: after early bird -- coach review
  // 2: finalised teams allocated
  const [status, setStatus] = useState(0);
  const [loading, setLoading] = useState(true);
  const [contest, setContest] = useState<ContestResponse | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [sort, setSort] = useState("Default");
  const { id } = useParams<{ id: string }>();

  const {
    userSession: { id: userId, role },
  } = useAuth();

  const getTimeDiff = () => {
    if (!contest) return "";
    const d0 = new Date(contest?.earlyBirdDate);
    const d1 = new Date();
    const d2 = new Date(contest?.cutoffDate);

    // Determine whether coach review has opened or not
    const suffix = d1 < d0 ? "opening" : "closing";
    const numMs =
      d1 < d0
        ? Math.abs(d0.getTime() - d1.getTime())
        : Math.abs(d2.getTime() - d1.getTime());
    const numHours = Math.floor(numMs / (1000 * 60 * 60));
    const days = Math.floor(numHours / 24);
    const hours = numHours % 24;

    return `${days} day${days === 1 ? "" : "s"} ${hours} hour${hours === 1 ? "" : "s"} before ${suffix}`;
  };

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
    setLoading(true);
    try {
      const userData = await getInfo(userId);
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
      let sorted = allTeams.filter((t) => t.members.length > 0);
      // Filters teams for specific university coach
      if (role === "Coach") {
        sorted = allTeams.filter(
          (team) => team.university === userData?.university,
        );
      } else if (userData && role === "Site Coordinator") {
        const unis = await siteToUniversity(userData.university);
        sorted = allTeams.filter((team) => unis.includes(team.university));
      }

      // If sort is applied, sort according to the type chosen
      if (sort === "Team Name") {
        sorted = sorted.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sort === "Institution") {
        sorted = sorted.sort((a, b) =>
          a.university.localeCompare(b.university),
        );
      }
      setTeams(sorted);
      setLoading(false);
    } catch (error) {
      console.log(`Get teams error: ${error}`);
    }
  }, [contest?.id, sort]);

  useEffect(() => {
    if (contest) {
      if (new Date() > new Date(contest?.cutoffDate)) {
        setStatus(2);
      } else if (new Date() > new Date(contest?.earlyBirdDate)) {
        setStatus(1);
      } else if (teams.length > 0 && role === "Admin") {
        setStatus(1);
      }
    }
  }, [teams]);

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
      <SortBy
        type={role === "Coach" ? "teams" : "teamsAll"}
        sort={sort}
        setSort={setSort}
      />
      {loading && (
        <div className={pageStyles["waiting-screen"]}>
          <CircularProgress />
        </div>
      )}
      {!loading && status === 0 && (
        <AdminWaitingScreen
          contest={contest}
          onTeamsAllocated={fetchTeams}
          role={role}
        />
      )}
      {!loading && status === 1 && (
        <Typography
          sx={{
            m: "10px 5px -15px",
            fontSize: "14px",
            fontWeight: "bold",
            color: "#42506d",
          }}
        >
          {`Coach Review: ${getTimeDiff()}`}
        </Typography>
      )}
      {!loading && status > 0 && (
        <TeamsList teams={teams} role={role} id={id} fetchTeams={fetchTeams} />
      )}
    </>
  );
};

export default Teams;
