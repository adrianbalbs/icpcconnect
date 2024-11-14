import { Button } from "@mui/material";
import { purpleBtn } from "@/styles/sxStyles";
import axios from "axios";
import { SERVER_URL } from "@/utils/constants";
import { ContestResponse } from "@/contests/page";
import WaitingScreenBase from "./WaitingScreenBase";

interface AdminWaitingScreenProps {
  contest: ContestResponse | null;
  onTeamsAllocated: () => Promise<void>;
}

const AdminWaitingScreen: React.FC<AdminWaitingScreenProps> = ({
  contest,
  onTeamsAllocated,
}) => {
  const handleRunAlgorithm = async () => {
    try {
      await axios.post(
        `${SERVER_URL}/api/admin/algo`,
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
      <Button sx={{ ...purpleBtn, mt: "15px" }} onClick={handleRunAlgorithm}>
        Allocate Teams
      </Button>
    </WaitingScreenBase>
  );
};

export default AdminWaitingScreen;
