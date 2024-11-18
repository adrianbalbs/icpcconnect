import pageStyles from "@/styles/Page.module.css";
import teamStyles from "@/styles/Teams.module.css";
import { Tooltip, tooltipClasses } from "@mui/material";
import { Member, Team } from "@/types/teams";
import DriveFileRenameOutlineOutlinedIcon from "@mui/icons-material/DriveFileRenameOutlineOutlined";
import { Box, IconButton, Modal } from "@mui/material";
import WarningIcon from "@mui/icons-material/WarningRounded";
import { useState } from "react";
import CloseBtn from "@/components/utils/CloseBtn";
import memberStyles from "@/styles/Members.module.css";
import axios from "axios";
import { SERVER_URL } from "@/utils/constants";

interface TeamCardProps {
  team: Team;
  canEdit: boolean;
  replacements: {
    reason: string;
    leavingUserId: string;
    replacementStudentId: string;
  }[];
  id: string;
  fetchTeams: () => Promise<void>;
}

/**
 * Team Card component
 * - renders a given team
 * - includes:
 *    - team name, institution, members list
 */
const TeamCard: React.FC<TeamCardProps> = ({
  team,
  canEdit,
  replacements,
  fetchTeams,
}) => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [reason, setReason] = useState("");
  const [substitute, setSubstitute] = useState("");
  const [openAlert, setOpenAlert] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [newMember, setNewMember] = useState("");

  const replacementArr: string[] = new Array(team.members.length).fill("");

  const handleClick = (
    member: Member,
    replacement: {
      reason: string;
      leavingUserId: string;
      replacementStudentId: string;
    },
  ) => {
    setOpenAlert(true);
    setSelectedMember(member);
    setReason(replacement.reason);
    setSubstitute(replacement.replacementStudentId);
  };

  const handleReplace = async (index: number, replace: string) => {
    console.log(index, replacementArr[index]);
    replacementArr[index] = replace;
  };

  const handleOpenEdit = async () => {
    setOpenEdit(true);
  };

  const handleEdit = async () => {
    for (const i in replacementArr) {
      if (replacementArr[i] != "") {
        try {
          await axios.put(
            `${SERVER_URL}/api/teams/handleReplacement/`,
            {
              team: team.id,
              student: team.members[i].id,
              replacedWith: replacementArr[i],
            },
            { withCredentials: true },
          );
        } catch (err) {
          console.log(err);
        }
      }
      replacementArr[i] = "";
    }
    if (newMember !== "") {
      await axios.put(
        `${SERVER_URL}/api/teams/update/sids/${team.id}`,
        {
          memberIds: [
            ...team.members.map((member) => member.studentId),
            newMember,
          ],
        },
        { withCredentials: true },
      );
    }
    fetchTeams();
    setOpenEdit(false);
  };

  const handleApprove = async () => {
    try {
      await axios.put(
        `${SERVER_URL}/api/teams/handlePullout/${selectedMember?.id}`,
        {
          accepting: true,
        },
        { withCredentials: true },
      );
      fetchTeams();
    } catch (err) {
      console.error(err);
    }
    setOpenAlert(false);
  };

  const handleReject = async () => {
    try {
      await axios.put(
        `${SERVER_URL}/api/teams/handlePullout/${selectedMember?.id}`,
        {
          accepting: false,
        },
        { withCredentials: true },
      );
      fetchTeams();
    } catch (err) {
      console.error(err);
    }
    setOpenAlert(false);
  };

  const replacedIds = replacements.map((r) => r.leavingUserId);

  return (
    <div className={teamStyles["team-container"]}>
      <div className={teamStyles.team}>
        <Tooltip
          title={team.name}
          placement="top-end"
          slotProps={{
            popper: {
              sx: {
                [`&.${tooltipClasses.popper}[data-popper-placement*="top"] .${tooltipClasses.tooltip}`]:
                  {
                    marginBottom: "2px",
                  },
              },
            },
          }}
        >
          <Box display="grid" mb="8px" gridTemplateColumns="9fr 1fr">
            <span className={teamStyles.overflow}>
              <b>Team Name:&nbsp;</b>
              {`${team.name}`}
            </span>
            {
              <IconButton
                onClick={handleOpenEdit}
                sx={{
                  p: "1px",
                  width: "15px",
                  height: "15px",
                  justifySelf: "end",
                }}
              >
                {canEdit && (
                  <DriveFileRenameOutlineOutlinedIcon
                    sx={{ fontSize: "18px" }}
                  />
                )}
              </IconButton>
            }
          </Box>
        </Tooltip>
        <p>
          <span className={pageStyles.bold}>Institution:</span>{" "}
          {team.university}
        </p>
        <p className={pageStyles.bold}>Members:</p>
        {team.members.map((member, index) => (
          <div key={index} style={{ display: "flex" }}>
            <p className={pageStyles.indented}>
              {`${member.givenName} ${member.familyName}`}
              {replacedIds.includes(member.id) && (
                <IconButton
                  onClick={() =>
                    handleClick(
                      member,
                      replacements[replacedIds.indexOf(member.id)],
                    )
                  }
                  color="warning"
                  aria-label="warning"
                  sx={{ padding: "0", marginBottom: "3px", marginLeft: "3px" }}
                >
                  <WarningIcon
                    sx={{
                      height: "14px",
                      width: "14px",
                      color: "rgb(245, 187, 68)",
                    }}
                  />
                </IconButton>
              )}
            </p>
          </div>
        ))}
      </div>
      <Modal open={openEdit} onClose={() => setOpenEdit(false)}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "left",
            backgroundColor: "white",
            position: "absolute",
            boxShadow: "10px solid black",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            maxHeight: "70%",
            padding: "50px",
            width: "50%",
          }}
        >
          <div style={{ width: "100%" }}>
            <p style={{ fontSize: "25px" }}>
              <b>Editing Team - </b>
              {team.name}
            </p>
          </div>
          <hr className={pageStyles["divider"]}></hr>
          <h2 style={{ margin: "10px 0" }}>
            <b>Members:</b>
          </h2>
          {team.members.map((member, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div className={memberStyles["member-name"]}>
                {`${member.givenName} ${member.familyName}`}{" "}
                {replacedIds.includes(member.id) && (
                  <IconButton
                    onClick={() =>
                      handleClick(
                        member,
                        replacements[replacedIds.indexOf(member.id)],
                      )
                    }
                    color="warning"
                    aria-label="warning"
                    sx={{
                      padding: "0",
                      marginBottom: "3px",
                      marginLeft: "3px",
                    }}
                  >
                    <WarningIcon
                      sx={{
                        height: "14px",
                        width: "14px",
                        color: "rgb(245, 187, 68)",
                      }}
                    />
                  </IconButton>
                )}
              </div>
              <input
                className={memberStyles["member-edit"]}
                placeholder="Replace with..."
                onChange={(e) => handleReplace(index, e.target.value)}
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "Replace with...")}
              />
            </div>
          ))}
          {team.members.length !== 3 && (
            <input
              className={memberStyles["member-add"]}
              placeholder="Add new member..."
              onChange={(e) => setNewMember(e.target.value)}
              onFocus={(e) => (e.target.placeholder = "")}
              onBlur={(e) => (e.target.placeholder = "Add new member...")}
            />
          )}
          <hr className={pageStyles["divider"]}></hr>
          <div
            style={{
              display: "flex",
              alignItems: "end",
              justifyContent: "center",
            }}
          >
            <button
              className={memberStyles.pullout}
              onClick={handleEdit}
              style={{ marginTop: "30px" }}
            >
              Done
            </button>
          </div>
          <CloseBtn handleClose={() => setOpenEdit(false)}></CloseBtn>
        </Box>
      </Modal>
      <Modal open={openAlert} onClose={() => setOpenAlert(false)}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "left",
            backgroundColor: "white",
            position: "absolute",
            boxShadow: "10px solid black",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            maxHeight: "70%",
            padding: "50px",
            width: "50%",
          }}
        >
          <div style={{ width: "100%" }}>
            <p style={{ fontSize: "25px" }}>
              <b>Pull Out Request - </b>
              {`${selectedMember?.givenName} ${selectedMember?.familyName}`}
            </p>
          </div>
          <hr className={pageStyles["divider"]}></hr>
          <b style={{ margin: "10px 0" }}>Reason</b>
          <div>{reason}</div>
          <hr className={pageStyles["divider"]}></hr>
          <b style={{ margin: "10px 0" }}>Substitute</b>
          <div>{substitute}</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <button
              className={memberStyles.pullout}
              onClick={handleApprove}
              style={{ marginTop: "30px" }}
            >
              Approve and modify team
            </button>
            &nbsp;&nbsp;
            <p style={{ marginTop: "30px" }}>or</p>
            &nbsp;&nbsp;
            <button
              className={memberStyles.pullout}
              onClick={handleReject}
              style={{ marginTop: "30px" }}
            >
              Reject request
            </button>
          </div>
          <CloseBtn handleClose={() => setOpenAlert(false)}></CloseBtn>
        </Box>
      </Modal>
    </div>
  );
};

export default TeamCard;
