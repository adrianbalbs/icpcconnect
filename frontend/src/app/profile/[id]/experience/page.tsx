"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { SERVER_URL } from "@/utils/constants";
import profileStyles from "@/styles/Profile.module.css";
import experienceStyles from "@/styles/Experience.module.css";
import { Box } from "@mui/material";
import ExperienceDialog from "@/components/experience/ExperienceDialog";
import LanguageExperience from "@/components/experience/LanguageExperience";
import CoursesExperience from "@/components/experience/CoursesExperience";
import { ProfileProps } from "../page";
import ContestExperience from "@/components/experience/ContestExperience";
import { User } from "@/types/users";
import { useAuth } from "@/components/context-provider/AuthProvider";
import { checkViewingPermissions } from "@/utils/profileInfo";
import { useRouter } from "next/navigation";
import Notif from "@/components/utils/Notif";

export interface ExperienceType {
  codeforcesRating: boolean;
  contestExperience: boolean;
  coursesCompleted: boolean;
  language: boolean;
  leetcodeRating: boolean;
}

export interface Experiences {
  level: "A" | "B";
  contestExperience: number;
  leetcodeRating: number;
  codeforcesRating: number;
  cppExperience: "none" | "some" | "prof";
  cExperience: "none" | "some" | "prof";
  javaExperience: "none" | "some" | "prof";
  pythonExperience: "none" | "some" | "prof";
  coursesCompleted: number[];
}

/**
 * Experiences Page
 * - buttons and dialog to add / edit / remove experiences
 */
const Experience: React.FC<ProfileProps> = ({ params }) => {
  // Object containing types of experiences added to page
  const [added, setAdded] = useState<ExperienceType>({
    codeforcesRating: false,
    contestExperience: false,
    coursesCompleted: false,
    language: false,
    leetcodeRating: false,
  });

  const [experience, setExperience] = useState<Experiences>({
    level: "A",
    contestExperience: 0,
    leetcodeRating: 0,
    codeforcesRating: 0,
    cppExperience: "none",
    cExperience: "none",
    javaExperience: "none",
    pythonExperience: "none",
    coursesCompleted: [],
  });

  const { userSession } = useAuth();
  const router = useRouter();
  const [notif, setNotif] = useState({ type: "", message: "" });

  const setMsg = (msg: string) => {
    setNotif({
      type: msg.includes("Deleted") ? "delete" : "add",
      message: msg,
    });
  };

  // Fetch experience data from backend
  const getExperience = useCallback(async () => {
    try {
      const res = await axios.get<User>(
        `${SERVER_URL}/api/users/${params.id}`,
        { withCredentials: true },
      );
      const {
        level,
        contestExperience,
        codeforcesRating,
        leetcodeRating,
        cExperience,
        cppExperience,
        javaExperience,
        pythonExperience,
        coursesCompleted,
      } = res.data;

      setExperience({
        level,
        contestExperience,
        codeforcesRating,
        leetcodeRating,
        cExperience,
        cppExperience,
        javaExperience,
        pythonExperience,
        coursesCompleted: coursesCompleted.map(
          (c: { id: number; type: string }) => c.id,
        ),
      });

      setAdded({
        codeforcesRating: codeforcesRating > 0,
        contestExperience: contestExperience > 0,
        coursesCompleted: coursesCompleted.length > 0,
        language:
          cExperience !== "none" ||
          cppExperience !== "none" ||
          pythonExperience !== "none" ||
          javaExperience !== "none",
        leetcodeRating: leetcodeRating > 0,
      });
    } catch (err) {
      console.log(`Get experience error: ${err}`);
    }
  }, [params.id]);

  // Used to do initial render of page when it first loads
  useEffect(() => {
    const initialisePage = async () => {
      await getExperience();
    };

    if (checkViewingPermissions(params.id, userSession)) {
      initialisePage();
    } else if (userSession.id !== "") {
      // Redirect user to 404 page not found if they don't have permission to view route
      router.replace("/404");
    }
  }, [getExperience, userSession]);

  return (
    <div className={profileStyles["inner-screen"]}>
      <div className={profileStyles.title}>
        <h3>Experience</h3>
      </div>
      <hr className={experienceStyles.divider} />
      <Box sx={{ height: "calc(100% - 121px)", overflow: "scroll" }}>
        {added.language && (
          <LanguageExperience
            {...experience}
            id={params.id}
            update={getExperience}
            setMsg={setMsg}
          />
        )}
        {added.coursesCompleted && (
          <CoursesExperience
            id={params.id}
            coursesTaken={experience.coursesCompleted}
            update={getExperience}
            setMsg={setMsg}
          />
        )}
        {(added.contestExperience ||
          added.leetcodeRating ||
          added.codeforcesRating) && (
          <ContestExperience
            id={params.id}
            added={added}
            experience={experience}
            update={getExperience}
            setMsg={setMsg}
          />
        )}
        {userSession.id === params.id && (
          <ExperienceDialog
            id={params.id}
            added={added}
            experience={experience}
            getExperience={getExperience}
            setMsg={setMsg}
          />
        )}
      </Box>
      {notif.type !== "" && <Notif notif={notif} setNotif={setNotif} />}
    </div>
  );
};

export default Experience;
