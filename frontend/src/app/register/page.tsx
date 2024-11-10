"use client";

import axios from "axios";
import { useState } from "react";
import { SERVER_URL } from "@/utils/constants";
import authStyles from "@/styles/Auth.module.css";
import { useRouter } from "next/navigation";
import { StepOne } from "@/components/register/StepOne";
import { StepTwo } from "@/components/register/StepTwo";

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [roleName, setRoleName] = useState("");
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [university, setUniversity] = useState(0);
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [eligibility, setEligibility] = useState(false);
  // const [verified, isVerified] = useState(false);

  const submitForm = async () => {
    try {
      if (password === confirmPassword && checked) {
        const payload = {
          givenName,
          familyName,
          role: roleName,
          university,
          email,
          password,
          verificationCode,
          ...(roleName === "Site Coordinator" || roleName === "Coach"
            ? { inviteCode }
            : {}),
          ...(roleName === "Student" ? { studentId } : {}),
        };
        await axios.post(`${SERVER_URL}/api/users`, payload);
        router.push("/login");
      } else if (password !== confirmPassword) {
        console.log("Passwords do not match");
      } else {
        console.log("Please agree to the terms and conditions.");
      }
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const verifyCode = async () => {
    if (verificationCode === "") {
      alert("Please enter a verification code.");
    } else {
      try {
        setLoading(true);
        const obj = {
          email,
          userProvidedCode: verificationCode,
        };
        await axios.post(
          `${SERVER_URL}/api/email/registVerificationVerify`,
          obj,
        );
        setStep((curStep) => curStep + 1);
      } catch (error) {
        alert("Invalid or incorrect verification code!");
        console.error("error:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const sendEmail = async () => {
    if (
      (roleName === "Student" && studentId === "") ||
      (roleName !== "Student" && inviteCode === "") ||
      university === 0 ||
      email === ""
    ) {
      alert("Please fill in the page.");
    } else {
      try {
        setLoading(true);
        const obj = {
          email,
          isNormalVerificationEmail: true,
        };
        await axios.post(`${SERVER_URL}/api/email/registVerificationSend`, obj);
        alert(
          "A verification code has been sent to the email address you entered.",
        );
        setStep((curStep) => curStep + 1);
      } catch (error) {
        alert(
          "An error occurred while trying to send a verification email. Did you enter a valid email address?",
        );
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNext = async () => {
    console.log({
      givenName,
      familyName,
      role: roleName,
      university,
      email,
      password,
      verificationCode,
    });
    if (step === 5 && (password === "" || confirmPassword === "")) {
      alert("Please enter a password.");
    } else if (step === 5 && !checked) {
      alert("Please agree to the Terms and Conditions.");
    } else if (step === 5 && password === confirmPassword) {
      submitForm();
    } else if (password !== confirmPassword) {
      alert("Passwords do not match!");
    } else if (step === 4) {
      await verifyCode();
    } else if (step === 3 && !loading) {
      await sendEmail();
    } else if (step === 2 && roleName === "Student" && !eligibility) {
      alert("You have not declared yourself eligible for the competition.");
    } else if (
      step === 1 &&
      (givenName === "" || familyName === "" || roleName === "")
    ) {
      alert("Please fill in the page.");
    } else {
      setStep((curStep) => curStep + 1);
    }
  };

  const handleBack = () => {
    setStep((curStep) => curStep - 1);
    if (step === 3) {
      setEligibility(false);
      if (roleName !== "Student") {
        setStep((curStep) => curStep - 1);
      } else {
        setStep(1);
      }
    }
  };

  return (
    <div className={authStyles.background}>
      <div className={authStyles["register-polygon"]}></div>
      <div className={authStyles["info-container"]}>
        {step === 1 && (
          <StepOne
            {...{
              givenName,
              setGivenName,
              familyName,
              setFamilyName,
              roleName,
              setRoleName,
              handleNext,
            }}
          />
        )}
        {step === 2 && (
          <>
            {roleName === "Student" ? (
              <StepTwo
                {...{
                  setEligibility,
                  handleBack,
                  handleNext,
                }}
              />
            ) : (
              handleNext()
            )}
          </>
        )}
        {step === 3 && (
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
              <option value={1}>UNSW</option>
              <option value={2}>University of Sydney</option>
              <option value={3}>University of Technology Sydney</option>
              <option value={4}>Macquarie University</option>
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
        )}
        {step === 4 && (
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
        )}
        {step === 5 && (
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
        )}
        {/* Unimplemented Progress Bar */}
        <div className={authStyles["progress-bar"]}></div>
      </div>
    </div>
  );
}
