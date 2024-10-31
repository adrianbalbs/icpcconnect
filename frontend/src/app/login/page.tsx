"use client";

import Image from "next/image";
import axios from "axios";
import styles from "@/styles/Auth.module.css";
import logo from "@/assets/logo.png";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SERVER_URL } from "@/utils/constants";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();

      const payload = {
        email,
        password,
      };
      const res = await axios.post(`${SERVER_URL}/api/login`, payload);
      const { token, id, role } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("id", id);
      localStorage.setItem("role", role);
      router.push(role === "student" ? "team" : "teams");
    } catch (error) {
      alert(`Login error: ${error}`);
    }
  };

  return (
    <div className={styles.background}>
      <div className={styles.shadow}>
        <div className={styles["login-polygon"]}></div>
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
          <button
            type="submit"
            className={`${styles["auth-button"]} ${styles["dark"]} ${styles["long"]}`}
          >
            Login
          </button>
        </form>
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
