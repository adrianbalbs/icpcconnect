"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addExperienceBtn } from "@/styles/sxStyles";
import profileStyles from "@/styles/Profile.module.css";
import experienceStyles from "@/styles/Experience.module.css";
import { checkViewingPermissions } from "@/utils/profileInfo";
import { Button } from "@mui/material";
import ChangePasswordDialog from "@/components/profile/ChangePasswordDialog";
import { useAuth } from "@/components/context-provider/AuthProvider";
import { ProfileProps } from "../page";
import Notif from "@/components/utils/Notif";

/**
 * Account Settings Page
 * - button and dialog to change password
 */
const AccountSettings: React.FC<ProfileProps> = ({ params }) => {
  const [open, setOpen] = useState(false);
  const { userSession } = useAuth();
  const router = useRouter();
  const [notif, setNotif] = useState({ type: "", message: "" });

  const setMsg = (msg: string) => {
    setNotif({ type: "update", message: msg });
  };

  useEffect(() => {
    if (
      userSession.id !== "" &&
      !checkViewingPermissions(params.id, userSession)
    ) {
      router.replace("/404");
    }
  }, [userSession]);

  return (
    <div className={profileStyles["inner-screen"]}>
      <div className={profileStyles.title}>
        <h3>Account Settings</h3>
      </div>
      <hr className={experienceStyles.divider} />
      <div className={experienceStyles.modal}>
        {!open ? (
          <Button
            variant="contained"
            sx={addExperienceBtn}
            onClick={() => setOpen(true)}
          >
            Change Password
          </Button>
        ) : (
          <ChangePasswordDialog setOpen={setOpen} setMsg={setMsg} />
        )}
      </div>
      {notif.type !== "" && <Notif notif={notif} setNotif={setNotif} />}
    </div>
  );
};

export default AccountSettings;
