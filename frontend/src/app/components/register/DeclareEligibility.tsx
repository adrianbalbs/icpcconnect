import authStyles from "@/styles/Auth.module.css";
import React, { Dispatch, SetStateAction, useState } from "react";

interface DeclareEligibilityProps {
  eligibility: boolean;
  setEligibility: Dispatch<SetStateAction<boolean>>;
  setStep: Dispatch<SetStateAction<number>>;
}

/**
 * Account Registration - Eligibility
 * - student only
 * - confirm eligibility to partake in ICPC
 */
export const DeclareEligibility: React.FC<DeclareEligibilityProps> = ({
  eligibility,
  setEligibility,
  setStep,
}) => {
  const [error, setError] = useState(true);

  const handleConfirm = () => {
    setEligibility(true);
    setError(false);
  };

  const handleDeny = () => {
    setEligibility(false);
    setError(true);
  };

  const handleNext = () => {
    if (!eligibility) {
      setError(true);
    } else {
      setStep(3);
    }
  };
  return (
    <>
      <h1 className={authStyles.h1}>Do you meet the ICPC eligibility rules?</h1>
      <br />
      <br />
      <p>
        The full eligibility rules can be found at &nbsp;
        <a href="https://icpc.global/regionals/rules/">
          https://icpc.global/regionals/rules/
        </a>
        , but the most notable criteria are:
        <br />
        <br />
        <ul>
          <li>enrolled in a degree program at the team&apos;s institution</li>
          <li>
            taking at least 1/2 load, or co-op, exchange or intern student
          </li>
          <li>have not competed in two ICPC World Finals</li>
          <li>
            have not competed in ICPC regional contests in five different years
          </li>
          <li>
            commenced post secondary studies in 2020 or later OR born in 2001 or
            later.
          </li>
          <br />
        </ul>
        You must meet the enrolment criteria in the term(s) that the contest is
        running. If any team members are not ICPC eligible, then the team will
        not be considered for qualification to Regional Finals.
        <br />
        <br />
      </p>
      <div className={authStyles["vertical-container"]}>
        <label>
          <input
            type="radio"
            name="eligibility"
            value="true"
            onChange={handleConfirm}
          />
          &nbsp;Yes
        </label>
        <label>
          <input
            type="radio"
            name="eligibility"
            value="false"
            onChange={handleDeny}
          />
          &nbsp;No
        </label>
      </div>
      <br />
      {error && (
        <>
          <p style={{ color: "#d32f2f" }}>
            You have not declared yourself eligible for the ICPC.
          </p>
          <br />
        </>
      )}
      <div className={authStyles["horizontal-container"]}>
        <button
          onClick={() => setStep(1)}
          className={`${authStyles["auth-button"]} ${authStyles["white"]} ${authStyles["short"]}`}
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className={`${authStyles["auth-button"]} ${authStyles["dark"]} ${authStyles["short"]}`}
        >
          Next
        </button>
      </div>
    </>
  );
};
