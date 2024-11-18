import pageStyles from "@/styles/Page.module.css";
import memberStyles from "@/styles/Members.module.css";
import Member, { MemberProps } from "./Member";
import { Box, Modal } from "@mui/material";
import { useState } from "react";
import CloseBtn from "../utils/CloseBtn";
import axios from "axios";
import { useAuth } from "../context-provider/AuthProvider";
import { SERVER_URL } from "@/utils/constants";

interface AssignedProps {
  members: MemberProps[];
  getTeam: () => Promise<void>;
  pendingPullOut: () => boolean;
}

/**
 * Team Page
 * - renders team of a student once teams are allocated
 */
const Assigned: React.FC<AssignedProps> = ({
  members,
  getTeam,
  pendingPullOut,
}) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [replacementId, setReplacementId] = useState("");
  const {
    userSession: { id },
  } = useAuth();
  const handleSubmit = async () => {
    try {
      await axios.post(
        `${SERVER_URL}/api/teams/createPullout/${id}`,
        {
          studentId: id,
          replacedWith: replacementId,
          reason,
        },
        { withCredentials: true },
      );
    } catch (err) {
      console.error(err);
    }
    getTeam();
    setOpen(false);
  };

  return (
    <>
      <div className={memberStyles.gap}>
        <div className={`${pageStyles.bold} ${memberStyles.staff}`}>
          <p>Team Member Name</p>
          <p>Student ID</p>
          <p>Email</p>
        </div>
        <hr className={pageStyles.divider} />
        {members.map((member) => (
          <Member key={member.id} {...member} />
        ))}
        <div
          style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}
        >
          {!pendingPullOut() ? (
            <button
              onClick={() => setOpen(true)}
              className={memberStyles.pullout}
            >
              Request to Pull Out
            </button>
          ) : (
            <button className={memberStyles["pullout-disabled"]}>
              Pending Pull Out Request
            </button>
          )}
        </div>

        <Modal open={open} onClose={() => setOpen(false)}>
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
            <div style={{ width: "100%" }}>
              <h2>Request to pull out from team</h2>
              <br />
              <b>Reason</b>
            </div>
            <textarea
              style={{ width: "100%" }}
              placeholder="Your reason for pulling out..."
              className={memberStyles["pullout-reason"]}
              onChange={(e) => setReason(e.target.value)}
            ></textarea>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "20px",
                width: "100%",
              }}
            >
              <b style={{ marginRight: "30px" }}>Substitution</b>
              <input
                placeholder="Leave blank if none"
                className={memberStyles["pullout-substitution"]}
                onChange={(e) => setReplacementId(e.target.value)}
              ></input>
            </div>
            <CloseBtn handleClose={() => setOpen(false)}></CloseBtn>
            <button
              className={memberStyles.pullout}
              onClick={handleSubmit}
              style={{ marginTop: "30px" }}
            >
              Submit
            </button>
          </Box>
        </Modal>
      </div>
    </>
  );
};

export default Assigned;
