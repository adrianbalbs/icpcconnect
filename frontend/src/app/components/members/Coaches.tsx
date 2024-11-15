"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { SERVER_URL } from "@/utils/constants";
import pageStyles from "@/styles/Page.module.css";
import memberStyles from "@/styles/Members.module.css";
import Staff, { StaffProps } from "./Staff";
import SortBy from "../utils/SortBy";

interface CoachInfo {
  id: string;
  givenName: string;
  familyName: string;
  email: string;
  role: string;
  university: string;
}

const Coaches = () => {
  const [coaches, setCoaches] = useState<StaffProps[]>([]);
  const [sort, setSort] = useState("Default");

  const getCoaches = async () => {
    try {
      const res = await axios.get<{ allUsers: CoachInfo[] }>(
        `${SERVER_URL}/api/users`,
        { withCredentials: true, params: { role: "Coach" } },
      );
      const allCoaches: CoachInfo[] = res.data.allUsers;
      const filteredInfo: StaffProps[] = allCoaches.map((coach) => ({
        id: coach.id,
        name: coach.givenName + " " + coach.familyName,
        institution: coach.university,
        email: coach.email,
      }));

      // Sort based on user option
      if (sort !== "Default") {
        const key = sort.toLowerCase() as keyof StaffProps;
        const sorted: StaffProps[] = filteredInfo.sort((a, b) =>
          a[key].localeCompare(b[key]),
        );
        setCoaches(sorted);
      } else {
        setCoaches(filteredInfo);
      }
    } catch (error) {
      console.log(`Get coaches: ${error}`);
    }
  };

  useEffect(() => {
    getCoaches();
  }, [sort]);

  return (
    <div className={memberStyles.gap}>
      <div className={`${pageStyles.bold} ${memberStyles.staff}`}>
        <p>Coach</p>
        <p>Institution</p>
        <p>Email</p>
      </div>
      <hr className={pageStyles.divider} />
      <SortBy type="members" sort={sort} setSort={setSort} />
      <hr className={pageStyles.divider} />
      {coaches.map((coach) => (
        <Staff key={coach.email} {...coach} />
      ))}
    </div>
  );
};

export default Coaches;
