"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import profileStyles from "@/styles/Profile.module.css";
import { Paper, ToggleButton, ToggleButtonGroup } from "@mui/material";

interface SidebarProps {
  id: string;
}

const Sidebar: React.FC<SidebarProps> = ({ id }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [tab, setTab] = useState("profile");

  const handleClick = (
    event: React.MouseEvent<HTMLElement>,
    nextTab: string,
  ) => {
    if (nextTab === null) return;
    const navTo = nextTab === "profile" ? "" : nextTab;
    router.replace(`/profile/${id}/${navTo}`);
  };

  useEffect(() => {
    if (pathname.includes("experience")) setTab("experience");
    else if (pathname.includes("preferences")) setTab("preferences");
    else if (pathname.includes("account-settings")) setTab("account-settings");
    else setTab("profile");
  }, [pathname]);

  return (
    <Paper elevation={3} className={profileStyles.sidebar}>
      <ToggleButtonGroup
        orientation="vertical"
        value={tab}
        onChange={handleClick}
        exclusive
      >
        <ToggleButton value="profile" className={profileStyles["sidebar-btn"]}>
          Profile
        </ToggleButton>
        <ToggleButton
          value="experience"
          className={profileStyles["sidebar-btn"]}
        >
          Experience
        </ToggleButton>
        <ToggleButton
          value="preferences"
          className={profileStyles["sidebar-btn"]}
        >
          Preferences
        </ToggleButton>
        <ToggleButton
          value="account-settings"
          className={profileStyles["sidebar-btn"]}
        >
          Account Settings
        </ToggleButton>
      </ToggleButtonGroup>
    </Paper>
  );
};

export default Sidebar;
