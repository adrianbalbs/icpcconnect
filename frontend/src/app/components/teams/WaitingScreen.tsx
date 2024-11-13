import { Dispatch, SetStateAction } from "react";
import pageStyles from "@/styles/Page.module.css";
import { Button } from "@mui/material";
import { enrolBtn, purpleBtn } from "@/styles/sxStyles";
import { useAuth } from "../AuthProvider/AuthProvider";
import { ContestResponse } from "@/contests/page";

interface WaitingProps {
  setStatus?: Dispatch<SetStateAction<number>>;
  handleWithdrawEnrollment?: () => void;
  contest: ContestResponse | null;
}

const WaitingScreen: React.FC<WaitingProps> = ({
  setStatus,
  contest,
  handleWithdrawEnrollment,
}) => {
  const { userSession } = useAuth();

  const nextStatus = () => {
    if (setStatus) {
      setStatus(1);
    }
  };
  const formatDate = (date: string | undefined) =>
    date ? date.split("T")[0] : undefined;

  const getDateDifference = (
    date1: string | undefined,
    date2: string | undefined,
  ) => {
    if (date1 && date2) {
      const timeDifference = Math.abs(
        new Date(date2).getTime() - new Date(date1).getTime(),
      );
      const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

      return daysDifference;
    }
    return undefined;
  };

  return (
    <div className={pageStyles["waiting-screen"]}>
      <p className={pageStyles.timeline}>
        Enrolment for team allocation closes at
        <span className={pageStyles.bold}>
          {" "}
          12.00am {formatDate(contest?.earlyBirdDate)}
        </span>
      </p>
      {userSession.role !== "Student" && (
        <p className={pageStyles.timeline}>
          Coach review opens for{" "}
          {getDateDifference(contest?.earlyBirdDate, contest?.cutoffDate)} days
          starting from
          <span className={pageStyles.bold}>
            {" "}
            12.00am {formatDate(contest?.earlyBirdDate)}
          </span>
        </p>
      )}
      <p className={pageStyles.timeline}>
        Finalised team allocations will be released after
        <span className={pageStyles.bold}>
          {" "}
          12.00am {formatDate(contest?.cutoffDate)}
        </span>
      </p>
      {userSession.role === "Admin" && (
        <Button sx={{ ...purpleBtn, mt: "15px" }} onClick={nextStatus}>
          Allocate Teams
        </Button>
      )}
      {userSession.role === "Student" && handleWithdrawEnrollment && (
        <Button sx={enrolBtn} onClick={handleWithdrawEnrollment}>
          Withdraw Enrollment
        </Button>
      )}
    </div>
  );
};

export default WaitingScreen;
