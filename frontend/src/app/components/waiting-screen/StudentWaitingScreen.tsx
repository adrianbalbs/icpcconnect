import { Button } from "@mui/material";
import { enrolBtn } from "@/styles/sxStyles";
import { ContestResponse } from "@/contests/page";
import WaitingScreenBase from "./WaitingScreenBase";

interface StudentWaitingScreenProps {
  contest: ContestResponse | null;
  onWithdraw: () => void;
}

const StudentWaitingScreen: React.FC<StudentWaitingScreenProps> = ({
  contest,
  onWithdraw,
}) => {
  return (
    <WaitingScreenBase contest={contest}>
      {onWithdraw && (
        <Button sx={enrolBtn} onClick={onWithdraw}>
          Withdraw Enrollment
        </Button>
      )}
    </WaitingScreenBase>
  );
};

export default StudentWaitingScreen;
