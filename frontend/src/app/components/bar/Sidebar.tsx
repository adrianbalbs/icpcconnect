"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import profileStyles from "@/styles/Profile.module.css";
import { Paper, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { sidebarBtn } from "@/styles/sxStyles";
import { useAuth } from "../AuthProvider/AuthProvider";

interface SidebarProps {
  profileId: string;
  profileRole: string;
}

const Sidebar: React.FC<SidebarProps> = ({ profileId, profileRole }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [tab, setTab] = useState("profile");
  const {
    userSession: { id, role },
  } = useAuth();

  const handleClick = (
    event: React.MouseEvent<HTMLElement>,
    nextTab: string,
  ) => {
    if (nextTab === null) return;
    const navTo = nextTab === "profile" ? "" : nextTab;
    router.replace(`/profile/${profileId}/${navTo}`);
  };

  const checkView = () => {
    if (profileRole === "Student") {
      if (role === "Student") {
        return id === profileId;
      }
      return role === "Coach" || role === "Admin";
    }
    return false;
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
        <ToggleButton value="profile" sx={sidebarBtn}>
          Profile
        </ToggleButton>
        {checkView() && (
          <ToggleButton value="experience" sx={sidebarBtn}>
            Experience
          </ToggleButton>
        )}
        {checkView() && (
          <ToggleButton value="preferences" sx={sidebarBtn}>
            Preferences
          </ToggleButton>
        )}
        {id === profileId && (
          <ToggleButton value="account-settings" sx={sidebarBtn}>
            Account Settings
          </ToggleButton>
        )}
      </ToggleButtonGroup>
    </Paper>
  );
};

export default Sidebar;