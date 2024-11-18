import pageStyles from "@/styles/Page.module.css";
import { ContestResponse } from "@/contests/page";

interface WaitingScreenBaseProps {
  contest: ContestResponse | null;
  children?: React.ReactNode;
}

/**
 * Base Waiting Screen
 * - shared basic waiting screen for all roles
 */
const WaitingScreenBase: React.FC<WaitingScreenBaseProps> = ({
  contest,
  children,
}) => {
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
      return Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
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
      <p className={pageStyles.timeline}>
        Coach review opens for{" "}
        {getDateDifference(contest?.earlyBirdDate, contest?.cutoffDate)} days
        starting from
        <span className={pageStyles.bold}>
          {" "}
          12.00am {formatDate(contest?.earlyBirdDate)}
        </span>
      </p>
      <p className={pageStyles.timeline}>
        Finalised team allocations will be released after
        <span className={pageStyles.bold}>
          {" "}
          12.00am {formatDate(contest?.cutoffDate)}
        </span>
      </p>
      {children}
    </div>
  );
};

export default WaitingScreenBase;
