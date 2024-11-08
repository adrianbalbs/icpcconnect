"use client";

import { useEffect, useState } from "react";
import pageStyles from "@/styles/Page.module.css";
import teamStyles from "@/styles/Teams.module.css";
import TeamsList from "@/components/teams/TeamsList";
import WaitingScreen from "@/components/teams/WaitingScreen";
import CircularProgress from "@mui/material/CircularProgress";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";

const statusStrings = [
  "Waiting for students to register...",
  "Waiting for all teams to be allocated...",
  "All teams",
];

const drawerWidth = 180;

const Teams: React.FC = () => {
  const [status, setStatus] = useState(0);

  useEffect(() => {
    if (status === 1) {
      const timeout = setTimeout(() => {
        setStatus(2);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [status]);

  return (
    <div className={pageStyles.screen}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            zIndex: 0,
          },
        }}
      >
        <Box sx={{ overflow: "auto" }}></Box>
        <Toolbar />
        <List>
          <ListItem key={"Teams"} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <GroupsIcon />
              </ListItemIcon>
              <ListItemText primary={"Teams"} />
            </ListItemButton>
          </ListItem>
          <ListItem key={"Members"} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary={"Members"} />
            </ListItemButton>
          </ListItem>
          <ListItem key={"My Team"} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary={"My Team"} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      <h1 className={teamStyles["teams-heading"]}>{statusStrings[status]}</h1>
      <hr className={pageStyles.divider} />
      {status === 0 && <WaitingScreen setStatus={setStatus} />}
      {status === 1 && (
        <div className={pageStyles["waiting-screen"]}>
          <CircularProgress />
        </div>
      )}
      {status === 2 && <TeamsList />}
    </div>
  );
};

export default Teams;
