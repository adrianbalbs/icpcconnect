"use client";

import pageStyles from "@/styles/Page.module.css";
import SiteCoordinators from "@/components/members/SiteCoordinators";
import Coaches from "@/components/members/Coaches";
import Students from "@/components/members/Students";
import Notif from "@/components/utils/Notif";
import InviteCode from "@/components/utils/InviteCode";
import { useAuth } from "@/components/AuthProvider/AuthProvider";
import { useState } from "react";

const Members: React.FC = () => {
  const [notif, setNotif] = useState({ type: "", name: "" });
  const {
    userSession: { role },
  } = useAuth();

  return (
    <>
      <Notif visible={notif.type !== ""} notif={notif} setNotif={setNotif} />
      <div className={pageStyles.screen}>
        {role === "Admin" && <InviteCode setNotif={setNotif} />}
        {role === "Admin" && <SiteCoordinators />}
        {(role === "Admin" || role === "Site Coordinator") && <Coaches />}
        <Students />
      </div>
    </>
  );
};

export default Members;
