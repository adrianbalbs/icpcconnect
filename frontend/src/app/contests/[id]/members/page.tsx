"use client";

import { useParams } from "next/navigation";
import SiteCoordinators from "@/components/members/SiteCoordinators";
import Coaches from "@/components/members/Coaches";
import Students from "@/components/members/Students";
import { useAuth } from "@/components/context-provider/AuthProvider";
import { useEffect, useState } from "react";
import Notif from "@/components/utils/Notif";

const Members: React.FC = () => {
  const {
    userSession: { role },
  } = useAuth();

  const { id } = useParams<{ id: string }>();
  const [notif, setNotif] = useState({ type: "", message: "" });

  const handleClose = () => {
    setNotif({ type: "", message: "" });
  };

  useEffect(() => {
    if (localStorage.getItem("accountDeleted")) {
      const name = localStorage.getItem("accountDeleted");
      localStorage.removeItem("accountDeleted");
      const message = `${name}'s account has been deleted successfully`;
      setNotif({ type: "delete", message: message });
    }
  }, []);

  return (
    <>
      {role === "Admin" && <SiteCoordinators />}
      {(role === "Admin" || role === "Site Coordinator") && <Coaches />}
      <Students contest={id} />
      {notif.type !== "" && <Notif notif={notif} setNotif={setNotif} />}
      {/* <Snackbar open={snackbar} autoHideDuration={3000} onClose={handleClose}>
        <Alert
          severity="error"
          variant="filled"
          onClose={handleClose}
          sx={{ height: "50px", width: "100%", bgcolor: "#d15c65" }}
        >
          {`${userDeleted}'s account has been deleted successfully`}
        </Alert>
      </Snackbar> */}
    </>
  );
};

export default Members;
