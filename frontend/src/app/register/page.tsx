"use client";

import axios from "axios";
import { useState } from "react";
import { SERVER_URL } from "@/utils/constants";
import authStyles from "@/styles/Auth.module.css";
import { useRouter } from "next/navigation";
import { RegisterRole } from "@/components/register/RegisterRole";
import { DeclareEligibility } from "@/components/register/DeclareEligibility";
import { LinearProgress } from "@mui/material";
import { EnterDetails } from "@/components/register/EnterDetails";
import { EnterInviteCode } from "@/components/register/EnterInviteCode";
import { CreatePassword } from "@/components/register/CreatePassword";

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
          ...(roleName === "Site Coordinator" || roleName === "Coach"
            ? { inviteCode }
            : {}),
          ...(roleName === "Student" ? { studentId } : {}),
        };
        const valid: { id: string } = await axios.post(
          `${SERVER_URL}/api/users`,
          payload,
        );
        // Checking whether the invite code they entered was valid
        if (valid.id === "INVALID") {
          alert("Registration failed: Invalid Invite Code Entered");
        } else {
          router.push("/login");
        }
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
          isNormalVerificationEmail: roleName === "Student",
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
      <div className={authStyles.shadow}>
        <div className={authStyles["register-polygon"]} />
      </div>
      <div className={authStyles["info-container"]}>
        {step === 1 && (
          <RegisterRole
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
              <DeclareEligibility
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
          <EnterDetails
            {...{
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
            }}
          ></EnterDetails>
        )}
        {step === 4 && (
          <EnterInviteCode
            {...{
              roleName,
              verificationCode,
              setVerificationCode,
              handleBack,
              handleNext,
            }}
          ></EnterInviteCode>
        )}
        {step === 5 && (
          <CreatePassword
            {...{
              roleName,
              password,
              setPassword,
              confirmPassword,
              setConfirmPassword,
              checked,
              setChecked,
              handleBack,
              handleNext,
            }}
          ></CreatePassword>
        )}
        <LinearProgress
          variant="determinate"
          value={(step - 1) * 20}
          sx={{
            width: "500px",
            backgroundColor: "#e8def8",
            "& .MuiLinearProgress-bar": {
              opacity: "70%",
              backgroundColor: "#65558f",
            },
          }}
        />
      </div>
    </div>
  );
}
