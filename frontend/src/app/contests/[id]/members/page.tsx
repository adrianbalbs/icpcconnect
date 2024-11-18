"use client";

import { useParams } from "next/navigation";
import SiteCoordinators from "@/components/members/SiteCoordinators";
import Coaches from "@/components/members/Coaches";
import Students from "@/components/members/Students";
import { useAuth } from "@/components/context-provider/AuthProvider";
import { useEffect, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

const Members: React.FC = () => {
  const {
    userSession: { role },
  } = useAuth();

  const { id } = useParams<{ id: string }>();
  const [snackbar, setSnackbar] = useState(false);
  const [userDeleted, setUserDeleted] = useState("");

  const handleClose = () => {
    setSnackbar(false);
  };

  useEffect(() => {
    if (localStorage.getItem("accountDeleted")) {
      const name = localStorage.getItem("accountDeleted");
      localStorage.removeItem("accountDeleted");
      setUserDeleted(name ?? "");
      setSnackbar(true);
    }
  }, []);

  return (
    <>
      {role === "Admin" && <SiteCoordinators />}
      {(role === "Admin" || role === "Site Coordinator") && <Coaches />}
      <Students contest={id} />
      <Snackbar open={snackbar} autoHideDuration={3000} onClose={handleClose}>
        <Alert
          severity="error"
          variant="filled"
          onClose={handleClose}
          sx={{ height: "50px", width: "100%", bgcolor: "#d15c65" }}
        >
          {`${userDeleted}'s account has been deleted successfully`}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Members;
