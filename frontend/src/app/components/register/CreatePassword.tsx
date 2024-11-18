import authStyles from "@/styles/Auth.module.css";
import React, { Dispatch, SetStateAction } from "react";

interface CreatePasswordProps {
  roleName: string;
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
  confirmPassword: string;
  setConfirmPassword: Dispatch<SetStateAction<string>>;
  checked: boolean;
  setChecked: Dispatch<SetStateAction<boolean>>;
  handleBack: () => void;
  handleNext: () => Promise<void>;
}

export const CreatePassword: React.FC<CreatePasswordProps> = ({
  roleName,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  checked,
  setChecked,
  handleBack,
  handleNext,
}) => {
  return (
    <>
      <h1 className={authStyles.h1}>Create a password</h1>
      <br />
      <h1 className={authStyles.h1} style={{ color: "#9298DA" }}>
        {roleName}
      </h1>
      <br />
      <input
        type="password"
        placeholder="Password"
        className={authStyles["input-field"]}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirm Password"
        className={authStyles["input-field"]}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      {!checked && (
        <>
          <p style={{ color: "red" }}>
            Please agree to the terms and conditions.
          </p>
          <br />
        </>
      )}
      {password !== confirmPassword && (
        <>
          <p style={{ color: "red" }}>Passwords do not match.</p>
          <br />
        </>
      )}
      <label htmlFor="tnc">
        <input
          id="tnc"
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        &nbsp;Yes, I agree to the{" "}
        <a className="link">Terms and Conditions of Use</a>
      </label>
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
          Register
        </button>
      </div>
    </>
  );
};
