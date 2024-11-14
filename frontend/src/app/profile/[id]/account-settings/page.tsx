"use client";

// import { useEffect, useState } from 'react';
import profileStyles from "@/styles/Profile.module.css";
import pageStyles from "@/styles/Page.module.css";
import Info from "@/components/profile/Info";
// import { ProfileProps } from '../page';

const AccountSettings: React.FC = () => {
  return (
    <div className={profileStyles["inner-screen"]}>
      <div className={profileStyles.title}>
        <h3>Account Settings</h3>
      </div>
      <hr className={pageStyles.divider} />
      <Info name="Password" value="yay" />
    </div>
  );
};

export default AccountSettings;
