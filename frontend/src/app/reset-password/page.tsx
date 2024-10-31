"use client";

import { SERVER_URL } from "@/utils/constants";
import axios from "axios";
import { useState } from "react";
import authStyles from "@/styles/Auth.module.css";
import { useRouter } from "next/navigation";

const ResetPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const handleNext = async () => {
    if (!loading) {
      try {
        setLoading(true);
        const obj = {
          email,
          userProvidedCode: verificationCode,
        };
        const res = await axios.post(`${SERVER_URL}/api/verify`, obj);
        console.log(res);
        setStep((curStep) => curStep + 1);
      } catch (error) {
        alert(
          "Something went wrong. Did you send a verification code to this email?",
        );
        console.error("error:", error);
      } finally {
        setLoading(false);
      }
    }
  };
  const handleSubmit = () => {
    if (password === "") {
      alert("Please enter a new password!");
    } else if (password === confirmPassword) {
      router.push("/login");
    } else {
      alert("Password and confirm password do not match!");
    }
  };
  return (
    <div className={authStyles.background}>
      <div className={authStyles.shadow}>
        <div className={authStyles["login-polygon"]}></div>
      </div>
      <div className={authStyles["info-container"]}>
        <h1 className={authStyles.h1}>Reset your password</h1>
        {step === 1 && (
          <>
            <p>
              Please enter the email address linked to your account and the
              verification code you were sent.
            </p>
            <input
              className={authStyles["input-field"]}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            ></input>
            <input
              className={authStyles["input-field"]}
              type="text"
              placeholder="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            ></input>
            <a href="/forgot-password" className={authStyles.link}>
              Don&apos;t have a code?
            </a>
            <button
              className={`${authStyles["auth-button"]} ${authStyles["dark"]} ${authStyles["long"]}`}
              onClick={handleNext}
            >
              Next
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              className={authStyles["input-field"]}
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            ></input>
            <input
              className={authStyles["input-field"]}
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            ></input>
            <button
              onClick={handleSubmit}
              className={`${authStyles["auth-button"]} ${authStyles["dark"]} ${authStyles["long"]}`}
            >
              Reset Password
            </button>
          </>
        )}
        <a
          href="/"
          className={`${authStyles["auth-button"]} ${authStyles["white"]} ${authStyles["long"]}`}
        >
          Back to Login
        </a>
      </div>
    </div>
  );
};

export default ResetPassword;
