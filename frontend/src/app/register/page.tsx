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
import { EnterCode } from "@/components/register/EnterCode";
import { CreatePassword } from "@/components/register/CreatePassword";

/**
 * Register Page
 * - register as: student, coach or site coordinator
 */
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
        const valid = await axios.post(`${SERVER_URL}/api/users`, payload);
        // Checking whether the invite code they entered was valid
        if (valid.data.id === "INVALID") {
          alert("Registration failed: Invalid Invite Code Entered");
        } else {
          router.push("/contests");
        }
      } else if (password !== confirmPassword) {
        console.log("Passwords do not match");
      } else {
        console.log("Please agree to the terms and conditions.");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      if (axios.isAxiosError(error) && error.response) {
        alert("Registration failed");
      }
    }
  };

  const verifyCode = async () => {
    try {
      setLoading(true);
      const obj = {
        email,
        userProvidedCode: verificationCode,
      };
      await axios.post(`${SERVER_URL}/api/email/registVerificationVerify`, obj);
      setStep(5);
    } catch (error) {
      console.error("error:", error);
      return true;
    } finally {
      setLoading(false);
    }
    return false;
  };

  const sendEmail = async () => {
    if (!loading) {
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
        setStep(4);
      } catch (error) {
        alert(
          "An error occurred while trying to send a verification email. Did you enter a valid email address?",
        );
        console.log(error);
      }
      setLoading(false);
    } else {
      alert("Another email is already being sent!");
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
              setStep,
            }}
          />
        )}
        {step === 2 && (
          <DeclareEligibility
            {...{
              eligibility,
              setEligibility,
              setStep,
            }}
          />
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
              setStep,
              sendEmail,
              setEligibility,
            }}
          ></EnterDetails>
        )}
        {step === 4 && (
          <EnterCode
            {...{
              roleName,
              verificationCode,
              setVerificationCode,
              setStep,
              verifyCode,
              sendEmail,
            }}
          ></EnterCode>
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
              setStep,
              submitForm,
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
