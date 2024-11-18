"use client";

import styles from "@/styles/Auth.module.css";
import Image from "next/image";
import logo from "../assets/logo.png";
import { useState } from "react";
import { useAuth } from "@/components/context-provider/AuthProvider";
import { TextField } from "@mui/material";

/**
 * Login Page
 * - login through email and password
 * - error: email or password incorrect
 */
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await login({ email, password }, setError);
  };

  return (
    <div className={styles.background}>
      <div className={styles.shadow}>
        <div className={styles["login-polygon"]} />
      </div>
      <div className={styles["info-container"]}>
        <Image
          src={logo}
          alt="ICPC Connect"
          width={400}
          className={styles["web-name"]}
        />
        <br />
        <form className={styles["form-container"]} onSubmit={handleLogin}>
          <TextField
            type="email"
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
            error={error}
            id="email-error"
            fullWidth
          />
          <TextField
            type="password"
            placeholder="Password"
            variant="standard"
            value={password}
            sx={{
              m: "20px 0",
              "& .MuiOutlinedInput-root": {
                "& .MuiInputBase-input": {
                  py: "10px",
                  fontSize: "14px",
                },
              },
            }}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
            id="password-error"
            fullWidth
            // helperText={error ? "Invalid username or password." : ""}
          />
          <a href="/forgot-password" className={styles.link}>
            Forgot Password?
          </a>
          <button
            type="submit"
            className={`${styles["auth-button"]} ${styles["dark"]} ${styles["long"]}`}
          >
            Login
          </button>
        </form>
        {error && (
          <>
            <p style={{ color: "#d32f2f" }}>Incorrect Email or Password!</p>
            <br />
          </>
        )}
        <div className={styles["horizontal-container"]}>
          <hr className={styles.hr} />
          or
          <hr className={styles.hr} />
        </div>
        <div className={styles["horizontal-container"]}>
          Don&apos;t have an account?&nbsp;
          <a href="register" className={styles.link}>
            Register
          </a>
        </div>
      </div>
    </div>
  );
}
