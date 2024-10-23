"use client";

import { useRouter } from "next/navigation";
import { Divider, Menu, MenuItem } from "@mui/material";
import { useAuth } from "../AuthProvider/AuthProvider";

interface DropdownProps {
  anchorEl: null | HTMLElement;
  open: boolean;
  handleClose: () => void;
}

const Dropdown: React.FC<DropdownProps> = ({ anchorEl, open, handleClose }) => {
  const router = useRouter();
  const { logout, userSession } = useAuth();

  const to = (route: string) => {
    router.push(`/profile/${userSession?.id}${route}`);
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
      MenuListProps={{
        "aria-labelledby": "basic-button",
      }}
    >
      <MenuItem sx={{ fontSize: "13px" }} onClick={() => to("")}>
        Profile
      </MenuItem>
      <MenuItem sx={{ fontSize: "13px" }} onClick={() => to("/experience")}>
        Experience
      </MenuItem>
      <MenuItem sx={{ fontSize: "13px" }} onClick={() => to("/preferences")}>
        Preferences
      </MenuItem>
      <MenuItem
        sx={{ fontSize: "13px" }}
        onClick={() => to("/account-settings")}
      >
        Account settings
      </MenuItem>
      <Divider />
      <MenuItem sx={{ fontSize: "13px" }} onClick={handleLogout}>
        Logout
      </MenuItem>
    </Menu>
  );
};

export default Dropdown;
