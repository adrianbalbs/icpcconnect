"use client";
import styles from "@/styles/Auth.module.css";
import Image from "next/image";
import logo from "../assets/logo.png";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider/AuthProvider";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const handleLogin = async () => {
    await login({ email, password });
  };

  return (
    <div className={styles.background}>
      <div className={styles.shadow}>
        <div className={styles["login-polygon"]} />
      </div>
      <div className={styles["info-container"]}>
        <Image src={logo} alt="" width={400} />
        <br />
        <div className={styles["form-container"]}>
          <input
            type="email"
            id="email"
            placeholder="Email"
            className={styles["input-field"]}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            id="password"
            placeholder="Password"
            className={styles["input-field"]}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <a href="/forgot-password" className={styles.link}>
            Forgot Password?
          </a>
        </div>
        <button
          onClick={handleLogin}
          className={`${styles["auth-button"]} ${styles["dark"]} ${styles["long"]}`}
        >
          Login
        </button>
        <div className={styles["horizontal-container"]}>
          <hr />
          or
          <hr />
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
