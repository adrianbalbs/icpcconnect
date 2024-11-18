"use client";
import {
  Box,
  Divider,
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
import UndoIcon from "@mui/icons-material/Undo";
import pageStyles from "@/styles/Page.module.css";
import { useAuth } from "@/components/context-provider/AuthProvider";
import { useRouter } from "next/navigation";

type ContestsLayoutProps = {
  children: React.ReactNode;
  params: {
    id: string;
  };
};

const drawerWidth = 180;

const ContestsLayout: React.FC<ContestsLayoutProps> = ({
  children,
  params,
}) => {
  const {
    userSession: { role },
  } = useAuth();
  const router = useRouter();

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
        <ListItem key={"Go Back"} disablePadding>
          <ListItemButton
            onClick={() => {
              router.push("/contests");
            }}
          >
            <ListItemIcon>
              <UndoIcon />
            </ListItemIcon>
            <ListItemText primary={"Go Back"} />
          </ListItemButton>
        </ListItem>
        <Divider />
        <List>
          {role === "Student" ? (
            <ListItem key={"My Team"} disablePadding>
              <ListItemButton
                onClick={() => {
                  router.push(`/contests/${params.id}/team`);
                }}
              >
                <ListItemIcon>
                  <GroupIcon />
                </ListItemIcon>
                <ListItemText primary={"My Team"} />
              </ListItemButton>
            </ListItem>
          ) : (
            <>
              <ListItem key={"Teams"} disablePadding>
                <ListItemButton
                  onClick={() => {
                    router.push(`/contests/${params.id}/teams`);
                  }}
                >
                  <ListItemIcon>
                    <GroupsIcon />
                  </ListItemIcon>
                  <ListItemText primary={"Teams"} />
                </ListItemButton>
              </ListItem>
              <ListItem key={"Members"} disablePadding>
                <ListItemButton
                  onClick={() => {
                    router.push(`/contests/${params.id}/members`);
                  }}
                >
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary={"Members"} />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
      {children}
    </div>
  );
};

export default ContestsLayout;
