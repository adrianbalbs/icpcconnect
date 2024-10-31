"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { SERVER_URL } from "@/utils/constants";
import pageStyles from "@/styles/Page.module.css";
import memberStyles from "@/styles/Members.module.css";
import Staff, { StaffProps } from "./Staff";

interface SiteCoordInfo {
  id: string;
  givenName: string;
  familyName: string;
  email: string;
  role: string;
  university: string;
}

const SiteCoordinators: React.FC = () => {
  const [siteCoords, setSiteCoords] = useState<StaffProps[]>([
    {
      id: "123",
      name: "Lily Belle",
      institution: "UNSW",
      email: "l.belle@unsw.edu.au",
    },
  ]);

  const getSiteCoords = async () => {
    try {
      const res = await axios.get<{ siteCoordinators: SiteCoordInfo[] }>(
        `${SERVER_URL}/api/site-coordinators`,
        { withCredentials: true },
      );
      const allSC: SiteCoordInfo[] = res.data.siteCoordinators;
      const filteredInfo: StaffProps[] = allSC.map((sc) => ({
        id: sc.id,
        name: sc.givenName + " " + sc.familyName,
        institution: sc.university,
        email: sc.email,
      }));
      setSiteCoords(filteredInfo);
    } catch (error) {
      console.log(`Get sitecoords: ${error}`);
    }
  };

  useEffect(() => {
    getSiteCoords();
  }, []);

  return (
    <div className={memberStyles.gap}>
      <div className={`${pageStyles.bold} ${memberStyles.staff}`}>
        <p>Site Coordinator</p>
        <p>Site</p>
        <p>Email</p>
      </div>
      <hr className={pageStyles.divider} />
      {siteCoords.map((siteCoord) => (
        <Staff key={siteCoord.id} {...siteCoord} />
      ))}
    </div>
  );
};

export default SiteCoordinators;
