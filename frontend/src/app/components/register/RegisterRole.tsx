import authStyles from "@/styles/Auth.module.css";
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import React, { Dispatch, SetStateAction, useState } from "react";

interface RegisterRoleProps {
  givenName: string;
  setGivenName: Dispatch<SetStateAction<string>>;
  familyName: string;
  setFamilyName: Dispatch<SetStateAction<string>>;
  roleName: string;
  setRoleName: Dispatch<SetStateAction<string>>;
  setStep: Dispatch<SetStateAction<number>>;
}

/**
 * Account Registration - First Step - Basic Details
 * - user enters: first / last name, role they wish to register as
 */
export const RegisterRole: React.FC<RegisterRoleProps> = ({
  givenName,
  setGivenName,
  familyName,
  setFamilyName,
  roleName,
  setRoleName,
  setStep,
}) => {
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const handleNext = () => {
    setHasAttemptedSubmit(true);

    const isNameValid = givenName !== "" && familyName !== "";
    const isRoleValid = roleName !== "";

    if (isNameValid && isRoleValid) {
      if (roleName === "Student") {
        setStep(2);
      } else {
        setStep(3);
      }
    }
  };

  return (
    <>
      <h1 className={authStyles.h1}>Create an account</h1>
      <div className={authStyles["horizontal-container"]}>
        <TextField
          placeholder="First Name"
          variant="standard"
          value={givenName}
          sx={{
            m: "20px 0",
            "& .MuiOutlinedInput-root": {
              "& .MuiInputBase-input": {
                py: "10px",
                fontSize: "14px",
              },
            },
            width: "230px",
            margin: "20px",
          }}
          onChange={(e) => setGivenName(e.target.value)}
          error={hasAttemptedSubmit && givenName === ""}
          helperText={
            hasAttemptedSubmit && givenName === ""
              ? "Please enter your first name."
              : ""
          }
        />
        <TextField
          placeholder="Last Name"
          variant="standard"
          value={familyName}
          sx={{
            m: "20px 0",
            "& .MuiOutlinedInput-root": {
              "& .MuiInputBase-input": {
                py: "10px",
                fontSize: "14px",
              },
            },
            width: "230px",
            margin: "20px",
          }}
          onChange={(e) => setFamilyName(e.target.value)}
          error={hasAttemptedSubmit && familyName === ""}
          helperText={
            hasAttemptedSubmit && familyName === ""
              ? "Please enter your last name."
              : ""
          }
        />
      </div>
      <FormControl
        variant="standard"
        fullWidth
        error={hasAttemptedSubmit && roleName === ""}
      >
        <InputLabel>Select Role</InputLabel>
        <Select value={roleName} onChange={(e) => setRoleName(e.target.value)}>
          <MenuItem value={"Student"}>Student</MenuItem>
          <MenuItem value={"Coach"}>Coach</MenuItem>
          <MenuItem value={"Site Coordinator"}>Site Coordinator</MenuItem>
        </Select>
        {hasAttemptedSubmit && roleName === "" && (
          <FormHelperText>Please select a role.</FormHelperText>
        )}
      </FormControl>
      <div className={authStyles["horizontal-container"]}>
        <a
          href={"/login"}
          className={`${authStyles["auth-button"]} ${authStyles["white"]} ${authStyles["short"]}`}
        >
          Back to Login
        </a>
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
