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
  type: "members" | "teams";
  sort: string;
  setSort: (sort: string) => void;
}

const list = {
  members: ["Default", "Name", "Team (students only)", "Institution", "Email"],
  teams: ["Default", "Team Name", "Institution"],
};

const SortBy = ({ type, sort, setSort }: SortByProps) => {
  const [open, setOpen] = useState(false);

  const handleOnClick = (type: string) => {
    console.log(type);
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
