import useUniversities from "@/hooks/useUniversities";
import authStyles from "@/styles/Auth.module.css";
import React, { Dispatch, SetStateAction } from "react";

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
  handleBack: () => void;
  handleNext: () => Promise<void>;
}

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
  handleBack,
  handleNext,
}) => {
  const { universities } = useUniversities();

  return (
    <>
      <h1 className={authStyles.h1}>Enter your details</h1>
      <br />
      <h1 className={authStyles.h1} style={{ color: "#9298DA" }}>
        {roleName}
      </h1>
      <br />
      <select
        id="select-university"
        name="Select University"
        className={authStyles["input-field"]}
        value={university}
        onChange={(e) => setUniversity(Number(e.target.value))}
      >
        <option value={0} disabled selected>
          Select University
        </option>
        {universities.map((university) => (
          <option key={university.id} value={university.id}>
            {university.name}
          </option>
        ))}
      </select>
      {roleName === "Student" ? (
        <form className={authStyles["form-container"]}>
          <input
            placeholder="Student ID"
            className={authStyles["input-field"]}
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />
          <input
            type="Email"
            id="email"
            placeholder="Email"
            className={authStyles["input-field"]}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </form>
      ) : (
        <form className={authStyles["form-container"]}>
          <input
            placeholder="Invite Code"
            className={authStyles["input-field"]}
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />
          <input
            type="Email"
            id="email"
            placeholder="Email"
            className={authStyles["input-field"]}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </form>
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
          Next
        </button>
      </div>
    </>
  );
};
