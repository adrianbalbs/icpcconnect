import { Button } from "@mui/material";
import { purpleBtn } from "@/styles/sxStyles";
import axios from "axios";
import { SERVER_URL } from "@/utils/constants";
import { ContestResponse } from "@/contests/page";
import WaitingScreenBase from "./WaitingScreenBase";
import { Role } from "@/types/users";

interface AdminWaitingScreenProps {
  contest: ContestResponse | null;
  role: Role;
  onTeamsAllocated: () => Promise<void>;
}

/**
 * Admin Waiting Screen
 * - renders waiting screen for admins during contest registration period
 * - screen that is shown when no teams have been allocated
 * - allocate team button: allocates team on click
 */
const AdminWaitingScreen: React.FC<AdminWaitingScreenProps> = ({
  contest,
  role,
  onTeamsAllocated,
}) => {
  const handleRunAlgorithm = async () => {
    try {
      await axios.post(
        `${SERVER_URL}/api/admin/algo`,
        { contestId: contest?.id },
        { withCredentials: true },
      );

      await axios.post(
        `${SERVER_URL}/api/email/sendTeamCreatedEmail`,
        { contestId: contest?.id },
        { withCredentials: true },
      );
      await onTeamsAllocated();
    } catch (err) {
      console.error(`An unexpected error occurred: ${err}`);
    }
  };

  return (
    <WaitingScreenBase contest={contest}>
      {role === "Admin" && (
        <Button
          variant="contained"
          sx={{ ...purpleBtn, mt: "30px", p: "10px 30px", fontWeight: "bold" }}
          onClick={handleRunAlgorithm}
        >
          Allocate Teams
        </Button>
      )}
    </WaitingScreenBase>
  );
};

export default AdminWaitingScreen;
