"use client";

import { SERVER_URL } from "@/utils/constants";
import axios from "axios";
import { useState } from "react";
import authStyles from "@/styles/Auth.module.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const sendEmail = async () => {
    try {
      const obj = {
        email,
        isNormalVerificationEmail: false,
      };
      await axios.post(`${SERVER_URL}/api/send`, obj);
      alert(
        "A verification code has been sent to the email address you entered.",
      );
      setEmail("");
    } catch (error) {
      alert(
        "An error occurred while trying to send a verification email. Did you enter a valid email address?",
      );
    }
  };
  return (
    <div className={authStyles.background}>
      <div className={authStyles.shadow}>
        <div className={authStyles["login-polygon"]}></div>
      </div>
      <div className={authStyles["info-container"]}>
        <h1 className={authStyles.h1}>Forgot your password?</h1>
        <p>
          Please enter the email address linked to your account and we'll send
          you a link to reset your password.
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
          Back to Home
        </a>
      </div>
    </div>
  );
};

export default ForgotPassword;
