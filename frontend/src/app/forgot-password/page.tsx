"use client";

import { SERVER_URL } from "@/utils/constants";
import axios from "axios";
import { useState } from "react";
import authStyles from "@/styles/Auth.module.css";

/**
 * Forget Password Page
 * - user enters their email to prompt for reset password link
 */
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const sendEmail = async () => {
    if (!loading) {
      try {
        const obj = {
          email,
        };
        setLoading(true);
        await axios.post(`${SERVER_URL}/api/email/forgotPasswordSend`, obj);
        alert(
          "An email with instructions to reset your password has been sent.",
        );
        setEmail("");
      } catch (error) {
        console.error(error);
        alert(
          "An error occurred while trying to send a verification email. Did you enter a valid email address?",
        );
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <div className={authStyles.background}>
      <div className={authStyles.shadow}>
        <div className={authStyles["login-polygon"]}></div>
      </div>
      <div className={authStyles["info-container"]}>
        <h1 className={authStyles.h1}>Forgot your password?</h1>
        <br />
        <p>
          Please enter the email address linked to your account and we&apos;ll
          send you a link to reset your password.
        </p>
        <input
          className={authStyles["input-field"]}
          type="email"
          id="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        ></input>
        <button
          className={`${authStyles["auth-button"]} ${authStyles["dark"]} ${authStyles["long"]}`}
          onClick={sendEmail}
        >
          Send Email
        </button>
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

export default ForgotPassword;
