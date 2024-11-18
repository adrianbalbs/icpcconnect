import { useUniversities } from "@/utils/university";
import authStyles from "@/styles/Auth.module.css";
import {
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import React, { Dispatch, SetStateAction, useState } from "react";

interface EnterDetailsProps {
  roleName: string;
  university: number;
  setUniversity: Dispatch<SetStateAction<number>>;
  studentId: string;
  setStudentId: Dispatch<SetStateAction<string>>;
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  inviteCode: string;
  setInviteCode: Dispatch<SetStateAction<string>>;
  setStep: Dispatch<SetStateAction<number>>;
  sendEmail: () => Promise<void>;
  setEligibility: Dispatch<SetStateAction<boolean>>;
}

/**
 * Account Registration - Further Details
 * - student enters: university, student id, email
 * - coach / site coordinator enters: university, invite code, email
 * note: invite codes are given by admin accounts only
 */
export const EnterDetails: React.FC<EnterDetailsProps> = ({
  roleName,
  university,
  setUniversity,
  studentId,
  setStudentId,
  email,
  setEmail,
  inviteCode,
  setInviteCode,
  setStep,
  sendEmail,
  setEligibility,
}) => {
  const [uniError, setUniError] = useState(false);
  const [inviteCodeError, setInviteCodeError] = useState(false);
  const [studentIdError, setStudentIdError] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const handleBack = () => {
    setEligibility(false);
    if (roleName === "Student") {
      setStep(2);
    } else {
      setStep(1);
    }
  };

  const handleNext = async () => {
    setUniError(university === 0);
    setInviteCodeError(roleName !== "Student" && inviteCode === "");
    setStudentIdError(roleName === "Student" && studentId === "");
    setEmailError(email === "");
    const valid = !(
      (university === 0 && roleName === "Student" && studentId === "") ||
      (roleName !== "Student" && inviteCode === "") ||
      university === 0 ||
      email === ""
    );
    if (valid) {
      await sendEmail();
    }
  };

  const { universities } = useUniversities();

  return (
    <>
      <h1 className={authStyles.h1}>Enter your details</h1>
      <br />
      <h1 className={authStyles.h1} style={{ color: "#9298DA" }}>
        {roleName}
      </h1>
      <br />
      <FormControl variant="standard" fullWidth error={uniError}>
        <Select
          value={university}
          onChange={(e) => setUniversity(Number(e.target.value))}
        >
          <MenuItem sx={{ color: "#777777" }} value={0}>
            <p style={{ color: "#BBBBBB" }}>Enter University</p>
          </MenuItem>
          {universities.map((university) => (
            <MenuItem key={university.id} value={university.id}>
              {university.name}
            </MenuItem>
          ))}
        </Select>
        {uniError && (
          <FormHelperText>Please select a university.</FormHelperText>
        )}
      </FormControl>
      <br />
      {roleName === "Student" ? (
        <TextField
          fullWidth
          placeholder="Student ID"
          variant="standard"
          value={studentId}
          sx={{
            m: "20px 0",
            "& .MuiOutlinedInput-root": {
              "& .MuiInputBase-input": {
                py: "10px",
                fontSize: "14px",
              },
            },
          }}
          onChange={(e) => setStudentId(e.target.value)}
          error={studentIdError}
          helperText={studentIdError ? "Please enter your student ID." : ""}
        />
      ) : (
        <TextField
          fullWidth
          placeholder="Invite Code"
          variant="standard"
          value={inviteCode}
          sx={{
            m: "20px 0",
            "& .MuiOutlinedInput-root": {
              "& .MuiInputBase-input": {
                py: "10px",
                fontSize: "14px",
              },
            },
          }}
          onChange={(e) => setInviteCode(e.target.value)}
          error={inviteCodeError}
          helperText={inviteCodeError ? "Please enter your invite code." : ""}
        />
      )}
      <TextField
        fullWidth
        placeholder="Email"
        variant="standard"
        value={email}
        sx={{
          m: "20px 0",
          "& .MuiOutlinedInput-root": {
            "& .MuiInputBase-input": {
              py: "10px",
              fontSize: "14px",
            },
          },
        }}
        onChange={(e) => setEmail(e.target.value)}
        error={emailError}
        helperText={emailError ? "Please enter your email." : ""}
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
