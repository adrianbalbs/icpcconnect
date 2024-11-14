"use client";

import { useState } from "react";
import { addBtn } from "@/styles/sxStyles";
import profileStyles from "@/styles/Profile.module.css";
import experienceStyles from "@/styles/Experience.module.css";
import { Button } from "@mui/material";
import ChangePasswordModal from "@/components/auth/ChangePasswordModal";
// import { ProfileProps } from '../page';

const AccountSettings: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className={profileStyles["inner-screen"]}>
      <div className={profileStyles.title}>
        <h3>Account Settings</h3>
      </div>
      <hr className={experienceStyles.divider} />
      {!open ? (
        <Button variant="contained" sx={addBtn} onClick={() => setOpen(true)}>
          Change Password
        </Button>
      ) : (
        <ChangePasswordModal setOpen={setOpen} />
      )}
    </div>
  );
};

export default AccountSettings;
