import authStyles from "@/styles/Auth.module.css";
import { TextField } from "@mui/material";
import React, { Dispatch, SetStateAction, useState } from "react";

interface CreatePasswordProps {
  roleName: string;
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
  confirmPassword: string;
  setConfirmPassword: Dispatch<SetStateAction<string>>;
  checked: boolean;
  setChecked: Dispatch<SetStateAction<boolean>>;
  setStep: Dispatch<SetStateAction<number>>;
  submitForm: () => Promise<void>;
}

/**
 * Account Registration - Last Step - Password
 * - user input: password, confirm password
 * - error: password !== confirm password
 */
export const CreatePassword: React.FC<CreatePasswordProps> = ({
  roleName,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  checked,
  setChecked,
  setStep,
  submitForm,
}) => {
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const validatePasswords = () => {
    let valid = true;

    if (!password) {
      setPasswordError("Please enter a password.");
      valid = false;
    } else if (password.length < 8) {
      setPasswordError("Password must be 8 or more characters.");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password.");
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      valid = false;
    } else {
      setConfirmPasswordError("");
    }

    return valid;
  };

  const handleBack = () => {
    setStep(4);
  };

  const handleNext = () => {
    if (validatePasswords() && checked) {
      submitForm();
    }
  };

  return (
    <>
      <h1 className={authStyles.h1}>Create a password</h1>
      <br />
      <h1 className={authStyles.h1} style={{ color: "#9298DA" }}>
        {roleName}
      </h1>
      <br />
      <TextField
        type="password"
        placeholder="Password"
        variant="standard"
        value={password}
        sx={{
          m: "20px 0",
          "& .MuiOutlinedInput-root": {
            "& .MuiInputBase-input": {
              py: "10px",
              fontSize: "14px",
            },
          },
        }}
        onChange={(e) => setPassword(e.target.value)}
        error={!!passwordError}
        id="password-error"
        fullWidth
        helperText={passwordError}
      />
      <TextField
        type="password"
        placeholder="Confirm Password"
        variant="standard"
        value={confirmPassword}
        sx={{
          m: "20px 0",
          "& .MuiOutlinedInput-root": {
            "& .MuiInputBase-input": {
              py: "10px",
              fontSize: "14px",
            },
          },
        }}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={!!confirmPasswordError}
        id="confirm-password-error"
        fullWidth
        helperText={confirmPasswordError}
      />
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
      <br />
      {!checked && (
        <>
          <p style={{ color: "red" }}>
            Please agree to the terms and conditions.
          </p>
          <br />
        </>
      )}
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
