"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import pageStyles from "@/styles/Page.module.css";
import SiteCoordinators from "@/components/members/SiteCoordinators";
import Coaches from "@/components/members/Coaches";
import Students from "@/components/members/Students";
import { useAuth } from "@/components/AuthProvider/AuthProvider";
import SortBy from "@/components/utils/SortBy";

const Members: React.FC = () => {
  const {
    userSession: { role },
  } = useAuth();

  const { id } = useParams<{ id: string }>();
  const [sort, setSort] = useState("Default");

  return (
    <>
      <SortBy type="members" sort={sort} setSort={setSort} />
      <hr className={pageStyles.divider} />
      {role === "Admin" && <SiteCoordinators sort={sort} />}
      {(role === "Admin" || role === "Site Coordinator") && (
        <Coaches sort={sort} />
      )}
      <Students contest={id} sort={sort} />
    </>
  );
};

export default Members;
