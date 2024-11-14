"use client";

import { useState } from "react";
import { addExperienceBtn } from "@/styles/sxStyles";
import profileStyles from "@/styles/Profile.module.css";
import experienceStyles from "@/styles/Experience.module.css";
import { Button } from "@mui/material";
import ChangePasswordModal from "@/components/settings/ChangePasswordModal";

const AccountSettings: React.FC = () => {
  const [open, setOpen] = useState(false);
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
