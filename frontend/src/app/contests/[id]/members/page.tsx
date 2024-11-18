"use client";

import { useParams } from "next/navigation";
import SiteCoordinators from "@/components/members/SiteCoordinators";
import Coaches from "@/components/members/Coaches";
import Students from "@/components/members/Students";
import { useAuth } from "@/components/context-provider/AuthProvider";
import { useEffect, useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import { getInfo } from "@/utils/profileInfo";

/**
 * Members Page - /contests/:id/members
 * - student has no access
 * - coach: views students
 * - site coordinators: views students and coaches
 * - admin: views students, coaches and site coordinators
 */
const Members: React.FC = () => {
  const {
    userSession: { id: ownId, role },
  } = useAuth();

  const { id } = useParams<{ id: string }>();
  const [userDeleted, setUserDeleted] = useState("");
  const [ownUni, setOwnUni] = useState("");

  const fetchInfo = async () => {
    const ownData = await getInfo(ownId);
    if (ownData) setOwnUni(ownData.university);
  };

  const handleClose = () => {
    localStorage.removeItem("accountDeleted");
    setUserDeleted("");
  };

  useEffect(() => {
    if (localStorage.getItem("accountDeleted")) {
      const name = localStorage.getItem("accountDeleted");
      setUserDeleted(name ?? "");
    }
    fetchInfo();
  }, []);

  return (
    <>
      {role === "Admin" && <SiteCoordinators />}
      {(role === "Admin" || role === "Site Coordinator") && (
        <Coaches role={role} ownUni={ownUni} />
      )}
      <Students role={role} ownUni={ownUni} contest={id} />
      {userDeleted !== "" && (
        <Snackbar
          open={userDeleted !== ""}
          autoHideDuration={5000}
          onClose={handleClose}
        >
          <Alert
            severity="error"
            variant="filled"
            onClose={handleClose}
            sx={{ height: "50px", width: "100%", bgcolor: "#d15c65" }}
          >
            {`${userDeleted}'s account has been deleted successfully`}
          </Alert>
        </Snackbar>
      )}
    </>
  );
};

export default Members;
