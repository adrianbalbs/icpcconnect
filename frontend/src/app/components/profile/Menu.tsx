"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/Profile.module.css";
import Dropdown from "./Dropdown";
import { Avatar, IconButton, Tooltip } from "@mui/material";
import { useAuth } from "../AuthProvider/AuthProvider";

const Menu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [info, setInfo] = useState({ role: "", name: "" });
  const {
    userSession: { role, givenName, familyName },
  } = useAuth();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const storeInfo = () => {
    setInfo({ role, name: `${givenName} ${familyName}` });
  };

  useEffect(() => {
    storeInfo();
  }, []);

  return (
    <div className={styles.menu}>
      <Tooltip title="Account profile">
        <IconButton
          onClick={handleClick}
          sx={{ height: "55px", width: "55px" }}
        >
          <Avatar>{info.name.charAt(0)}</Avatar>
        </IconButton>
      </Tooltip>
      <div className={styles["pfp-label"]}>
        <p className={styles["pfp-role"]}>{info.role}</p>
        <p className={styles["pfp-name"]}>{info.name}</p>
      </div>
      <Dropdown anchorEl={anchorEl} open={open} handleClose={handleClose} />
    </div>
  );
};

export default Menu;
