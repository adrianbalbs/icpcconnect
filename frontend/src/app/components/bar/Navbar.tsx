import { useState } from "react";
import pageStyles from "@/styles/Page.module.css";
import profileStyles from "@/styles/Profile.module.css";
import { Avatar, IconButton, Tooltip } from "@mui/material";
import Dropdown from "../profile/Dropdown";
import { useNav } from "../context-provider/NavProvider";

/**
 * Navbar component
 * - renders website name in top left corner
 * - renders a user's name, role and profile image in top right corner
 */
const Navbar: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { navInfo } = useNav();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className={pageStyles.navbar}>
      <h1 className={pageStyles.website}>ICPCC</h1>
      <div className={profileStyles.menu}>
        <Tooltip title="Account profile">
          <IconButton
            onClick={handleClick}
            sx={{ mr: "5px", height: "55px", width: "55px" }}
          >
            <Avatar src={navInfo.pfp} sx={{ bgcolor: "#b3bac9" }}>
              {navInfo.name.charAt(0)}
            </Avatar>
          </IconButton>
        </Tooltip>
        <div className={profileStyles["pfp-label"]}>
          <p className={profileStyles["pfp-role"]}>{navInfo.role}</p>
          <p className={profileStyles["pfp-name"]}>{navInfo.name}</p>
        </div>
        <Dropdown anchorEl={anchorEl} open={open} handleClose={handleClose} />
      </div>
    </div>
  );
};

export default Navbar;
