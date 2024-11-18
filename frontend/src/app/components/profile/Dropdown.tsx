"use client";

import { useRouter } from "next/navigation";
import { Divider, Menu, MenuItem } from "@mui/material";
import { useAuth } from "../context-provider/AuthProvider";
import { menuBtn } from "@/styles/sxStyles";

interface DropdownProps {
  anchorEl: null | HTMLElement;
  open: boolean;
  handleClose: () => void;
}

/**
 * Navbar Profile Dropdown component
 * - renders a dropdown when profile icon in navbar is clicked
 * - includes:
 *    - profile
 *    - experiences (student only)
 *    - preferences (student only)
 *    - account settings
 */
const Dropdown: React.FC<DropdownProps> = ({ anchorEl, open, handleClose }) => {
  const router = useRouter();
  const { logout, userSession } = useAuth();

  const to = (route: string) => {
    router.push(`/profile/${userSession.id}${route}`);
    handleClose();
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      sx={{ marginTop: "5px" }}
      MenuListProps={{
        "aria-labelledby": "basic-button",
      }}
    >
      <MenuItem sx={menuBtn} onClick={() => to("")}>
        Profile
      </MenuItem>
      {userSession.role === "Student" && (
        <MenuItem sx={menuBtn} onClick={() => to("/experience")}>
          Experience
        </MenuItem>
      )}
      {userSession.role === "Student" && (
        <MenuItem sx={menuBtn} onClick={() => to("/preferences")}>
          Preferences
        </MenuItem>
      )}
      <MenuItem sx={menuBtn} onClick={() => to("/account-settings")}>
        Account settings
      </MenuItem>
      <Divider />
      <MenuItem sx={menuBtn} onClick={handleLogout}>
        Logout
      </MenuItem>
    </Menu>
  );
};

export default Dropdown;
