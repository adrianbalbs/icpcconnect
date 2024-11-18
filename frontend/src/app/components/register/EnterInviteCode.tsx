import authStyles from "@/styles/Auth.module.css";
import React, { Dispatch, SetStateAction } from "react";

interface EnterInviteCodeProps {
  roleName: string;
  verificationCode: string;
  setVerificationCode: Dispatch<SetStateAction<string>>;
  handleBack: () => void;
  handleNext: () => Promise<void>;
}

export const EnterInviteCode: React.FC<EnterInviteCodeProps> = ({
  roleName,
  verificationCode,
  setVerificationCode,
  handleBack,
  handleNext,
}) => {
  return (
    <>
      <h1 className={authStyles.h1}>Verify email address</h1>
      <br />
      <h1 className={authStyles.h1} style={{ color: "#9298DA" }}>
        {roleName}
      </h1>
      <br />
      <input
        placeholder="Enter Verification Code"
        className={authStyles["input-field"]}
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value)}
      />
      <div className={authStyles["horizontal-container"]}>
        <button
          onClick={handleBack}
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
