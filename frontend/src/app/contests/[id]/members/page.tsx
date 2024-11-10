"use client";

import SiteCoordinators from "@/components/members/SiteCoordinators";
import Coaches from "@/components/members/Coaches";
import Students from "@/components/members/Students";
import { useAuth } from "@/components/AuthProvider/AuthProvider";

const Members: React.FC = () => {
  const {
    userSession: { role },
  } = useAuth();

  return (
    <>
      {role === "Admin" && <SiteCoordinators />}
      {(role === "Admin" || role === "Site Coordinator") && <Coaches />}
      <Students />
    </>
  );
};

export default Members;