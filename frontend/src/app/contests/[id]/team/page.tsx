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
import { useAuth } from "@/components/context-provider/AuthProvider";
import { useParams } from "next/navigation";
import { ContestResponse } from "@/contests/page";
import StudentWaitingScreen from "@/components/waiting-screen/StudentWaitingScreen";
import { Box, CircularProgress, IconButton, Modal } from "@mui/material";
import WarningIcon from "@mui/icons-material/WarningRounded";
import CloseBtn from "@/components/utils/CloseBtn";
import memberStyles from "@/styles/Members.module.css";
import Notif from "@/components/utils/Notif";

type TeamInfo = {
  id: string;
  name: string;
  members: MemberProps[];
  replacements: {
    reason: string;
    leavingUserId: string;
    replacementStudentId: string;
  }[];
};

/**
 * Team Page - /contests/:id/team
 * - student only
 * - renders either registration page, waiting screen or actual team
 */
const Team: React.FC = () => {
  const [status, setStatus] = useState<
    "unregistered" | "awaiting" | "assigned"
  >("unregistered");
  const [uni, setUni] = useState("");
  const [contest, setContest] = useState<ContestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [openPullOut, setOpenPullOut] = useState(false);
  const [team, setTeam] = useState<TeamInfo>({
    id: "",
    name: "",
    members: [],
    replacements: [],
  });
  const {
    userSession: { id },
  } = useAuth();
  const params = useParams<{ id: string }>();
  const [notif, setNotif] = useState({ type: "", message: "" });

  const pendingPullOut = () => {
    return team.replacements.map((member) => member.leavingUserId).includes(id);
  };

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
      setMsg("Withdrawn From Contest Successfully!");
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
      const res = await axios.get(
        `${SERVER_URL}/api/teams/student/${id}/contest/${params.id}`,
        {
          withCredentials: true,
        },
      );
      setTeam(res.data);
      setStatus("assigned");
    } catch (err) {
      console.log(`Student get team error: ${err}`);
    }
  }, [id]);

  const deletePullOut = async () => {
    try {
      await axios.delete(`${SERVER_URL}/api/teams/deletePullout/${id}`, {
        withCredentials: true,
      });
    } catch (err) {
      console.error(err);
    }
    getTeam();
    setOpenPullOut(false);
  };

  const setMsg = (msg: string) => {
    setNotif({ type: "enrol", message: msg });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([getTeam(), fetchContest(), fetchEnrollment()]);
      setLoading(false);
    };

    if (id) {
      fetchData();
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
            setMsg={setMsg}
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
        return (
          <Assigned
            members={team.members}
            getTeam={getTeam}
            pendingPullOut={pendingPullOut}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <h1 className={teamStyles["team-heading"]}>
        Team:
        <StatusDisplay status={status} teamName={team.name} />
        {pendingPullOut() && (
          <IconButton
            onClick={() => setOpenPullOut(true)}
            color="warning"
            aria-label="warning"
            sx={{ padding: "0", marginBottom: "3px", marginLeft: "3px" }}
          >
            <WarningIcon
              sx={{
                height: "20px",
                width: "20px",
                color: "rgb(245, 187, 68)",
              }}
            />
          </IconButton>
        )}
      </h1>
      <p className={teamStyles.university}>{uni}</p>
      {status !== "assigned" && <hr className={pageStyles.divider} />}
      {renderStatusContent()}
      <Modal open={openPullOut} onClose={() => setOpenPullOut(false)}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
            backgroundColor: "white",
            position: "absolute",
            boxShadow: "10px solid black",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            maxHeight: "70%",
            padding: "50px",
            width: "35%",
          }}
        >
          <div
            style={{
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h2 style={{ textAlign: "center" }}>
              Cancel Pending Pull Out Request
            </h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "20px",
                width: "100%",
                justifyContent: "center",
              }}
            >
              <p style={{ textAlign: "center" }}>
                You have requested to pull out from the contest.
                <br />
                <br />
                Would you like to cancel the pending pull out request?
              </p>
            </div>
            <CloseBtn handleClose={() => setOpenPullOut(false)}></CloseBtn>
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "space-around",
              }}
            >
              <button
                className={memberStyles.pullout}
                onClick={deletePullOut}
                style={{ marginTop: "30px" }}
              >
                Yes
              </button>
              <button
                className={memberStyles.pullout}
                onClick={() => setOpenPullOut(false)}
                style={{ marginTop: "30px" }}
              >
                No
              </button>
            </div>
          </div>
        </Box>
      </Modal>
      {notif.type !== "" && <Notif notif={notif} setNotif={setNotif} />}
    </>
  );
};

type StatusDisplayProps = {
  status: "unregistered" | "awaiting" | "assigned";
  teamName: string;
};

const StatusDisplay: React.FC<StatusDisplayProps> = ({ status, teamName }) => {
  if (status === "assigned")
    return <span className={teamStyles.status}> {teamName}</span>;
  const statusText =
    status === "awaiting" ? "(Awaiting allocation)" : "(Not allocated)";
  return <span className={teamStyles.status}> {statusText}</span>;
};

export default Team;
