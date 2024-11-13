"use client";

import SiteCoordinators from "@/components/members/SiteCoordinators";
import Coaches from "@/components/members/Coaches";
import Students from "@/components/members/Students";
import { useAuth } from "@/components/AuthProvider/AuthProvider";
import { useParams } from "next/navigation";

const Members: React.FC = () => {
  const {
    userSession: { role },
  } = useAuth();

  const { id } = useParams<{ id: string }>();

  return (
    <>
      {role === "Admin" && <SiteCoordinators />}
      {(role === "Admin" || role === "Site Coordinator") && <Coaches />}
      <Students contest={id} />
    </>
  );
};

export default Members;
