"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addExperienceBtn } from "@/styles/sxStyles";
import profileStyles from "@/styles/Profile.module.css";
import experienceStyles from "@/styles/Experience.module.css";
import { checkViewingPermissions } from "@/utils/profileInfo";
import { Button } from "@mui/material";
import ChangePasswordModal from "@/components/settings/ChangePasswordModal";
import { useAuth } from "@/components/AuthProvider/AuthProvider";
import { ProfileProps } from "../page";
// import Error from "next/error";

const AccountSettings: React.FC<ProfileProps> = ({ params }) => {
  const [open, setOpen] = useState(false);
  const { userSession } = useAuth();
  const router = useRouter();

  // if (!checkViewingPermissions(params.id, userSession)) {
  //   return <Error statusCode={404} />;
  // }

  // Redirect user to 404 page not found if they don't have permission to view route
  useEffect(() => {
    if (!checkViewingPermissions(params.id, userSession)) {
      router.replace("/404");
    }
  }, []);

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
          <ChangePasswordModal setOpen={setOpen} />
        )}
      </div>
    </div>
  );
};

export default AccountSettings;
