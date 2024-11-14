"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { SERVER_URL } from "@/utils/constants";
import { getInfo } from "@/utils/profileInfo";
import pageStyles from "@/styles/Page.module.css";
import teamStyles from "@/styles/Teams.module.css";
import Assigned from "@/components/team/Assigned";
import TeamRegistration from "@/components/team/TeamRegistration";
import { MemberProps } from "@/components/team/Member";
import { useAuth } from "@/components/AuthProvider/AuthProvider";
import { useParams } from "next/navigation";
import { ContestResponse } from "@/contests/page";
import StudentWaitingScreen from "@/components/waiting-screen/StudentWaitingScreen";

type TeamInfo = {
  id: string;
  name: string;
  members: MemberProps[];
};

const Team: React.FC = () => {
  const [status, setStatus] = useState<
    "unregistered" | "awaiting" | "assigned"
  >("unregistered");
  const [uni, setUni] = useState("");
  const [contest, setContest] = useState<ContestResponse | null>(null);
  const [team, setTeam] = useState<TeamInfo>({
    id: "",
    name: "Tomato Factory",
    members: [],
  });
  const {
    userSession: { id },
  } = useAuth();
  const params = useParams<{ id: string }>();

  const fetchContest = useCallback(async () => {
    try {
      const contest = await axios.get<ContestResponse>(
        `${SERVER_URL}/api/contests/${params.id}`,
        { withCredentials: true },
      );
      setContest(contest.data);
    } catch (err) {
      console.log(err);
    }
  }, [params.id]);

  const fetchEnrollment = useCallback(async () => {
    try {
      await axios.get(
        `${SERVER_URL}/api/users/${id}/contest-registration/${params.id}`,
        { withCredentials: true },
      );
      if (status === "unregistered") setStatus("awaiting");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        console.log("Not enrolled yet!");
        setStatus("unregistered");
      } else {
        console.error(err);
      }
    }
  }, [id, params.id, status]);

  const handleWithdrawEnrollment = async () => {
    try {
      await axios.delete(
        `${SERVER_URL}/api/users/${id}/contest-registration/${params.id}`,
        { withCredentials: true },
      );
      setStatus("unregistered");
    } catch (err) {
      console.error(err);
    }
  };

  const getTeam = useCallback(async () => {
    try {
      const studentData = await getInfo(id);
      if (studentData) {
        setUni(studentData.university);
      }
      const res = await axios.get(`${SERVER_URL}/api/teams/student/${id}`, {
        withCredentials: true,
      });
      setTeam(res.data);
      setStatus("assigned");
    } catch (err) {
      console.log(`Student get team error: ${err}`);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      getTeam();
      fetchContest();
      fetchEnrollment();
    }
  }, [id, params.id]);

  const renderStatusContent = () => {
    switch (status) {
      case "unregistered":
        return (
          <TeamRegistration
            contestId={params.id}
            cutoffDate={contest?.cutoffDate}
            fetchEnrollment={fetchEnrollment}
          />
        );
      case "awaiting":
        return (
          <StudentWaitingScreen
            contest={contest}
            onWithdraw={handleWithdrawEnrollment}
          />
        );
      case "assigned":
        return <Assigned members={team.members} />;
      default:
        return null;
    }
  };

  return (
    <>
      <h1 className={teamStyles["team-heading"]}>
        Team:
        <StatusDisplay status={status} teamName={team.name} />
      </h1>
      <p className={teamStyles.university}>{uni}</p>
      {status !== "assigned" && <hr className={pageStyles.divider} />}
      {renderStatusContent()}
    </>
  );
};

type StatusDisplayProps = {
  status: "unregistered" | "awaiting" | "assigned";
  teamName: string;
};

const StatusDisplay: React.FC<StatusDisplayProps> = ({ status, teamName }) => {
  if (status === "assigned") return <span> {teamName}</span>;
  const statusText =
    status === "awaiting" ? "(Awaiting allocation)" : "(Not allocated)";
  return <span className={teamStyles.status}> {statusText}</span>;
};

export default Team;
