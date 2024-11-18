"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import profileStyles from "@/styles/Profile.module.css";
import { Paper, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { sidebarBtn } from "@/styles/sxStyles";
import { useAuth } from "../context-provider/AuthProvider";

interface SidebarProps {
  id: string;
  role: string;
}

/**
 * Sidebar component
 * - renders a user's profile image, name, role and pronouns on left of screen
 * - renders a side bar containing buttons that may navigate to
 *    - Profile page
 *    - Experience page (student only)
 *    - Preference page (student only)
 *    - Account Settings page
 */
const Sidebar: React.FC<SidebarProps> = ({ id, role }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [tab, setTab] = useState("profile");
  const { userSession } = useAuth();

  const handleClick = (
    event: React.MouseEvent<HTMLElement>,
    nextTab: string,
  ) => {
    if (nextTab === null) return;
    const navTo = nextTab === "profile" ? "" : nextTab;
    router.replace(`/profile/${id}/${navTo}`);
  };

  const checkView = () => {
    if (role === "Student") {
      if (userSession.role === "Student") {
        return userSession.id === id;
      }
      return userSession.role === "Coach" || userSession.role === "Admin";
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
        {userSession.id === id && (
          <ToggleButton value="account-settings" sx={sidebarBtn}>
            Account Settings
          </ToggleButton>
        )}
      </ToggleButtonGroup>
    </Paper>
  );
};

export default Sidebar;
