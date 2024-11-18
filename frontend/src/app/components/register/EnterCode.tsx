import authStyles from "@/styles/Auth.module.css";
import { TextField } from "@mui/material";
import React, { Dispatch, SetStateAction, useState } from "react";

interface EnterCodeProps {
  roleName: string;
  verificationCode: string;
  setVerificationCode: Dispatch<SetStateAction<string>>;
  setStep: Dispatch<SetStateAction<number>>;
  verifyCode: () => Promise<boolean>;
  sendEmail: () => Promise<void>;
}

/**
 * Account Registration - Email verification
 * - after email is sent to user, user enters verification code
 */
export const EnterCode: React.FC<EnterCodeProps> = ({
  roleName,
  verificationCode,
  setVerificationCode,
  setStep,
  verifyCode,
  sendEmail,
}) => {
  const [codeError, setCodeError] = useState(false);

  const handleBack = () => {
    setStep(3);
  };

  const handleNext = async () => {
    const error = await verifyCode();
    setCodeError(error);
  };

  return (
    <>
      <h1 className={authStyles.h1}>Verify email address</h1>
      <br />
      <h1 className={authStyles.h1} style={{ color: "#9298DA" }}>
        {roleName}
      </h1>
      <br />
      <TextField
        fullWidth
        placeholder="Verification Code"
        variant="standard"
        value={verificationCode}
        sx={{
          m: "20px 0",
          "& .MuiOutlinedInput-root": {
            "& .MuiInputBase-input": {
              py: "10px",
              fontSize: "14px",
            },
          },
        }}
        onChange={(e) => setVerificationCode(e.target.value)}
        error={codeError}
        helperText={codeError ? "Incorrect or invalid verification code!" : ""}
      />
      <div style={{ width: "500px", display: "flex", justifyContent: "end" }}>
        Didn&apos;t get the code?&nbsp;
        <button
          onClick={sendEmail}
          style={{ background: "none", border: "none", fontSize: "16px" }}
          className={authStyles.link}
        >
          Resend
        </button>
      </div>
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
