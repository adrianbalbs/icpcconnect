"use client";
import loginPage from "../styles/Auth.module.css";
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
    <>
      <div className={loginPage["login-polygon"]}></div>
      <div className={loginPage["info-container"]}>
        <Image src={logo} alt="" width={400} />
        <br />
        <div className={loginPage["form-container"]}>
          <input
            type="email"
            id="email"
            placeholder="Email"
            className={loginPage["input-field"]}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            id="password"
            placeholder="Password"
            className={loginPage["input-field"]}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <a href="/forgot-password" className={loginPage.link}>
            Forgot Password?
          </a>
        </div>
        <button
          onClick={handleLogin}
          className={`${loginPage["auth-button"]} ${loginPage["dark"]} ${loginPage["long"]}`}
        >
          Login
        </button>
        <div className={loginPage["horizontal-container"]}>
          <hr></hr>
          or
          <hr></hr>
        </div>
        <div className={loginPage["horizontal-container"]}>
          Don&apos;t have an account?&nbsp;
          <a href="register" className={loginPage.link}>
            Register
          </a>
        </div>
      </div>
    </>
  );
}
