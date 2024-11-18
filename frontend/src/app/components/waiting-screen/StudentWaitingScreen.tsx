import { Button } from "@mui/material";
import { enrolBtn } from "@/styles/sxStyles";
import { ContestResponse } from "@/contests/page";
import WaitingScreenBase from "./WaitingScreenBase";

interface StudentWaitingScreenProps {
  contest: ContestResponse | null;
  onWithdraw: () => void;
}

/**
 * Student Waiting Screen
 * - renders waiting screen for students during contest registration period
 * - screen that is shown when no teams have been allocated
 * - withdraw button: pulls out from contest enrolment
 */
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
