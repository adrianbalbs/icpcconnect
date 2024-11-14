"use client";

import { useCallback, useEffect, useState } from "react";
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
  // const [status, setStatus] = useState(0);
  const [status, setStatus] = useState(2);
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
      setStatus(1);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setStatus(2);
        // setStatus(0);
      } else {
        console.error(err);
      }
    }
  }, [id, params.id]);

  const handleWithdrawEnrollment = async () => {
    try {
      await axios.delete(
        `${SERVER_URL}/api/users/${id}/contest-registration/${params.id}`,
        { withCredentials: true },
      );
      // setStatus(0);
      setStatus(2);
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
  }, [id]);

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([getTeam(), fetchContest(), fetchEnrollment()]);
    };

    if (id) initializeData();
  }, [getTeam, fetchContest, fetchEnrollment]);

  // DELETE
  const generateTeam = async () => {
    await axios.post(`${SERVER_URL}/api/teams/register`, {
      name: "hello", //name of team
      university: 1, //university id - think 0 works?
      memberIds: [
        "c47253b3-5181-4680-81e0-01fc7b3c6c09",
        "c14933de-4025-4391-a1bc-62eb8d76b716",
        "2ad0e0b7-04a1-4d29-91d1-5024d394aaf1",
        "c14933de-4025-4391-a1bc-62eb8d76b716",
      ], //user-ids of member
      flagged: false, // just set to false
    });
  };

  return (
    <>
      <h1 className={teamStyles["team-heading"]}>
        Team:
        {status === 2 && <span> {team.name}</span>}
        {status !== 2 && (
          <span className={teamStyles.status}> {statusStrings[status]}</span>
        )}
      </h1>
      {/*delete*/}
      <button
        className={pageStyles["tile-button"]}
        onClick={generateTeam}
      ></button>
      <p className={teamStyles.university}>{uni}</p>
      {status !== 2 && <hr className={pageStyles.divider} />}
      {status === 0 && (
        <TeamRegistration
          contestId={params.id}
          cutoffDate={contest?.cutoffDate}
          fetchEnrollment={fetchEnrollment}
        />
      )}
      {status === 1 && (
        <WaitingScreen
          setStatus={setStatus}
          contest={contest}
          handleWithdrawEnrollment={handleWithdrawEnrollment}
        />
      )}
      {/* {status === 2 && <Assigned members={team.members} />} */}
      {status === 2 && (
        <Assigned
          members={[
            {
              id: "w",
              givenName: "nadrew",
              familyName: "sub",
              studentId: "12312",
              email: "andrew@gmail.com",
            },
            {
              id: "string",
              givenName: "aaron",
              familyName: "hub",
              studentId: "12312",
              email: "ah@gmail.com",
            },
            {
              id: "e",
              givenName: "teehee",
              familyName: "ssfgk",
              studentId: "12312",
              email: "teeheews@gmail.com",
            },
          ]}
        />
      )}
    </>
  );
};

export default Team;
