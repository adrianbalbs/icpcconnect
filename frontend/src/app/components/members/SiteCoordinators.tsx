"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { SERVER_URL } from "@/utils/constants";
import pageStyles from "@/styles/Page.module.css";
import memberStyles from "@/styles/Members.module.css";
import Staff, { StaffProps } from "./Staff";
import SortBy from "../utils/SortBy";

interface SiteCoordInfo {
  id: string;
  givenName: string;
  familyName: string;
  email: string;
  role: string;
  university: string;
}

/**
 * Site Coordinators component
 * - renders list of site coordinators
 */
const SiteCoordinators = () => {
  const [siteCoords, setSiteCoords] = useState<StaffProps[]>([]);
  const [sort, setSort] = useState("Default");

  const getSiteCoords = async () => {
    try {
      const res = await axios.get<{ allUsers: SiteCoordInfo[] }>(
        `${SERVER_URL}/api/users`,
        { withCredentials: true, params: { role: "Site Coordinator" } },
      );
      const allSC: SiteCoordInfo[] = res.data.allUsers;
      const filteredInfo: StaffProps[] = allSC.map((sc) => ({
        id: sc.id,
        name: sc.givenName + " " + sc.familyName,
        institution: sc.university,
        email: sc.email,
      }));

      // Sort based on user option
      if (sort !== "Default") {
        const key = sort.toLowerCase() as keyof StaffProps;
        const sorted: StaffProps[] = filteredInfo.sort((a, b) =>
          a[key].localeCompare(b[key]),
        );
        setSiteCoords(sorted);
      } else {
        setSiteCoords(filteredInfo);
      }
    } catch (error) {
      console.log(`Get sitecoords: ${error}`);
    }
  };

  useEffect(() => {
    getSiteCoords();
  }, [sort]);

  return (
    <div className={memberStyles.gap}>
      <div className={`${pageStyles.bold} ${memberStyles.staff}`}>
        <p>Site Coordinator</p>
        <p>Site</p>
        <p>Email</p>
      </div>
      <hr className={pageStyles.divider} />
      <SortBy type="members" sort={sort} setSort={setSort} />
      <hr className={pageStyles.divider} />
      {siteCoords.map((siteCoord) => (
        <Staff key={siteCoord.id} {...siteCoord} />
      ))}
    </div>
  );
};

export default SiteCoordinators;
