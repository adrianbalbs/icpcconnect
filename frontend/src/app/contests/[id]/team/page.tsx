"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { SERVER_URL } from "@/utils/constants";
import { getInfo } from "@/utils/profileInfo";
import pageStyles from "@/styles/Page.module.css";
import teamStyles from "@/styles/Teams.module.css";
import Assigned from "@/components/team/Assigned";
import WaitingScreen from "@/components/teams/WaitingScreen";
import TeamRegistration from "@/components/team/TeamRegistration";
import { MemberProps } from "@/components/team/Member";
import { useAuth } from "@/components/AuthProvider/AuthProvider";
import { useParams } from "next/navigation";
import { ContestResponse } from "@/contests/page";

interface TeamInfo {
  id: string;
  name: string;
  members: MemberProps[];
}

const statusStrings = ["(Not allocated)", "(Awaiting allocation)"];

const Team: React.FC = () => {
  const [status, setStatus] = useState(0);
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

  const fetchContest = async () => {
    try {
      const contest = await axios.get<ContestResponse>(
        `${SERVER_URL}/api/contests/${params.id}`,
        { withCredentials: true },
      );
      setContest(contest.data);
    } catch (err) {
      console.log(err);
    }
  };

  const getTeam = async () => {
    try {
      const studentData = await getInfo(id);
      if (studentData) {
        setUni(studentData.university);
      }

      // const res = await axios.get(`${SERVER_URL}/api/teams/student/${id}`, {
      //   withCredentials: true,
      // });
      // setTeam(res.data);
      setTeam({
        id: "",
        name: "Tomato Factory",
        members: [],
      });
    } catch (error) {
      console.log(`Student get team error: ${error}`);
    }
  };

  useEffect(() => {
    getTeam();
    fetchContest();
  }, []);

  return (
    <>
      <h1 className={teamStyles["team-heading"]}>
        Team:
        {status === 2 && <span> {team.name}</span>}
        {status !== 2 && (
          <span className={teamStyles.status}> {statusStrings[status]}</span>
        )}
      </h1>
      <p className={teamStyles.university}>{uni}</p>
      {status !== 2 && <hr className={pageStyles.divider} />}
      {status === 0 && <TeamRegistration />}
      {status === 1 && (
        <WaitingScreen setStatus={setStatus} contest={contest} />
      )}
      {status === 2 && <Assigned members={team.members} />}
    </>
  );
};

export default Team;
