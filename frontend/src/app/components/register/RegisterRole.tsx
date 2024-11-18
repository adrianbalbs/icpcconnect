import authStyles from "@/styles/Auth.module.css";
import React, { Dispatch, SetStateAction } from "react";

interface RegisterRoleProps {
  givenName: string;
  setGivenName: Dispatch<SetStateAction<string>>;
  familyName: string;
  setFamilyName: Dispatch<SetStateAction<string>>;
  roleName: string;
  setRoleName: Dispatch<SetStateAction<string>>;
  handleNext: () => Promise<void>;
}

export const RegisterRole: React.FC<RegisterRoleProps> = ({
  givenName,
  setGivenName,
  familyName,
  setFamilyName,
  roleName,
  setRoleName,
  handleNext,
}) => {
  return (
    <>
      <h1 className={authStyles.h1}>Create an account</h1>
      <div className={authStyles["horizontal-container"]}>
        <input
          placeholder="First Name"
          className={authStyles["input-field-short"]}
          value={givenName}
          onChange={(e) => setGivenName(e.target.value)}
        />
        <input
          placeholder="Last Name"
          className={authStyles["input-field-short"]}
          value={familyName}
          onChange={(e) => setFamilyName(e.target.value)}
        />
      </div>
      <select
        value={roleName}
        onChange={(e) => setRoleName(e.target.value)}
        id="select-role"
        name="Select Role"
        className={authStyles["input-field"]}
      >
        <option value="" disabled selected>
          Select Role
        </option>
        <option value="Student">Student</option>
        <option value="Coach">Coach</option>
        <option value="Site Coordinator">Site Coordinator</option>
      </select>
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
