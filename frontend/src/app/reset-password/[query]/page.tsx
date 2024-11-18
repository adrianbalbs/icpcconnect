"use client";

import { SERVER_URL } from "@/utils/constants";
import axios from "axios";
import { useEffect, useState } from "react";
import authStyles from "@/styles/Auth.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";

interface ResetPasswordProps {
  params: {
    query: string;
  };
}

/**
 * Reset Password Page
 * - user is directed here through their email
 * - can change password
 */
const ResetPassword: React.FC<ResetPasswordProps> = ({ params }) => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkIsValid = async () => {
    try {
      const res = await axios.post(
        `${SERVER_URL}/api/email/verifyForgotPassword`,
        {
          id: params.query,
          authenticationCode: searchParams.get("q") ?? "",
        },
      );
      setIsValid(res.status === 200);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      console.log(isValid);
    }
    return;
  };

  const searchParams = useSearchParams();
  const handleSubmit = async () => {
    if (password === "") {
      alert("Please enter a new password!");
    } else if (password === confirmPassword) {
      await axios.post(`${SERVER_URL}/api/email/resetForgotPassword`, {
        id: params.query,
        newPassword: password,
      });
      router.push("/login");
    } else {
      alert("Password and confirm password do not match!");
    }
  };

  useEffect(() => {
    checkIsValid();
  }, [params]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100vw",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  } else if (!isValid) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100vw",
          height: "100vh",
        }}
      >
        This page does not exist! →&nbsp;
        <a
          href="/login"
          style={{ color: "#5962b6", textDecoration: "underline" }}
        >
          Back to Login
        </a>
      </Box>
    );
  } else {
    return (
      <div className={authStyles.background}>
        <div className={authStyles.shadow}>
          <div className={authStyles["login-polygon"]}></div>
        </div>
        <div className={authStyles["info-container"]}>
          <h1 className={authStyles.h1}>Reset your password</h1>
          <br />
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
          <a
            href="/"
            className={`${authStyles["auth-button"]} ${authStyles["white"]} ${authStyles["long"]}`}
          >
            Back to Login
          </a>
        </div>
      </div>
    );
  }
};

export default ResetPassword;
