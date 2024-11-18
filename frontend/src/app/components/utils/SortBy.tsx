import { useState } from "react";
import {
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { ExpandLess, ExpandMore, SortRounded } from "@mui/icons-material";
import { sortIcons } from "@/styles/sxStyles";

interface SortByProps {
  type: "students" | "members" | "teams" | "teamsAll";
  sort: string;
  setSort: (sort: string) => void;
}

const list = {
  students: ["Default", "Name", "Team", "Institution", "Email"],
  members: ["Default", "Name", "Institution", "Email"],
  teams: ["Default", "Team Name"],
  teamsAll: ["Default", "Team Name", "Institution"],
};

/**
 * Sort By Dropdown component
 * - renders dropdowns that contain different options to sort by
 */
const SortBy = ({ type, sort, setSort }: SortByProps) => {
  const [open, setOpen] = useState(false);

  const handleOnClick = (type: string) => {
    setSort(type);
    setOpen(false);
  };

  return (
    <>
      <List component="nav" sx={{ p: 0, width: "100%", minWidth: 170 }}>
        <ListItemButton
          sx={{ p: "4px 10px 4px 0" }}
          onClick={() => setOpen(!open)}
        >
          <ListItemIcon sx={{ minWidth: "35px" }}>
            <SortRounded sx={sortIcons} />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography
                sx={{ fontSize: "12px" }}
              >{`Sort by ${sort}`}</Typography>
            }
          />
          {open ? <ExpandLess sx={sortIcons} /> : <ExpandMore sx={sortIcons} />}
        </ListItemButton>
        <Collapse in={open} timeout="auto" unmountOnExit>
          {list[type].map((val) => (
            <List key={val} component="div" disablePadding>
              <ListItemButton
                sx={{ p: "2px 10px 2px 35px" }}
                onClick={() => handleOnClick(val)}
              >
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: "11px" }}>{val}</Typography>
                  }
                />
              </ListItemButton>
            </List>
          ))}
        </Collapse>
      </List>
    </>
  );
};

export default SortBy;
