import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { SERVER_URL } from "@/utils/constants";
import pageStyles from "@/styles/Page.module.css";
import teamStyles from "@/styles/Teams.module.css";
import Tile from "./Tile";
import { getInfo } from "@/utils/profileInfo";
import { useAuth } from "../context-provider/AuthProvider";
import { getPreferences } from "@/utils/preferenceInfo";
import { Button, Stack } from "@mui/material";
import { User } from "@/types/users";
import { enrolBtn } from "@/styles/sxStyles";

type TeamRegistrationProps = {
  contestId: string;
  cutoffDate?: string;
  fetchEnrollment: () => void;
  setMsg: (msg: string) => void;
};

/**
 * Team Registration Page
 * - when student is not enroled in a team yet and registration is still open,
 *   students can complete steps to fill in their profile details
 * - once all details have been completed, student may enrol to be in contest
 */
const TeamRegistration: React.FC<TeamRegistrationProps> = ({
  contestId,
  cutoffDate,
  fetchEnrollment,
  setMsg,
}) => {
  const [completed, setCompleted] = useState(0);
  const [added, setAdded] = useState({
    profile: false,
    experience: false,
    preference: false,
  });

  const {
    userSession: { id },
  } = useAuth();

  const checkProfile = useCallback(async () => {
    try {
      const profile = await getInfo(id);
      if (profile && profile.editInfo.pronouns) {
        setAdded((prev) => ({ ...prev, profile: true }));
      }
    } catch (err) {
      console.log(`Check profile error: ${err}`);
    }
  }, [id]);

  const checkExperience = useCallback(async () => {
    try {
      const { data } = await axios.get<User>(`${SERVER_URL}/api/users/${id}`, {
        withCredentials: true,
      });

      const hasAnyExperience =
        data.codeforcesRating > 0 ||
        data.leetcodeRating > 0 ||
        data.coursesCompleted.length > 0 ||
        [
          data.cppExperience,
          data.cExperience,
          data.javaExperience,
          data.pythonExperience,
        ].some((experience: string) => experience !== "none");

      if (hasAnyExperience) {
        setAdded((prev) => ({ ...prev, experience: true }));
      }
    } catch (err) {
      console.log(`Check experience error: ${err}`);
    }
  }, [id]);

  const checkPreference = useCallback(async () => {
    try {
      const preference = await getPreferences(id, "preferences");
      const exclusion = await getPreferences(id, "exclusions");
      if (
        (preference && preference.length > 0) ||
        (exclusion && exclusion.length > 0)
      ) {
        setAdded((prev) => ({ ...prev, preference: true }));
      }
    } catch (err) {
      console.log(`Check preference error: ${err}`);
    }
  }, [id]);

  const handleContestRegistration = async () => {
    try {
      await axios.post(
        `${SERVER_URL}/api/users/contest-registration`,
        {
          student: id,
          contest: contestId,
        },
        { withCredentials: true },
      );
      fetchEnrollment();
      setMsg("Enrolled For Contest Successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const isAfterCutoffDate = (cutoffDate: string | undefined) => {
    return cutoffDate ? new Date() > new Date(cutoffDate) : false;
  };

  const getProfileUrl = (path: string) => `/profile/${id}${path}`;

  useEffect(() => {
    const fetchInitialData = async () => {
      await Promise.all([checkProfile(), checkExperience(), checkPreference()]);
    };

    if (id) fetchInitialData();
  }, [checkProfile, checkExperience, checkPreference]);

  useEffect(() => {
    setCompleted(Object.values(added).filter((a) => a).length);
  }, [added]);

  return (
    <>
      <h1 className={teamStyles.todo}>Todo</h1>
      <p className={teamStyles.indent}>
        <span className={teamStyles.bold}>{completed} of 3 </span>
        completed
      </p>
      <div className={pageStyles["horizontal-container"]}>
        <Tile
          title="Edit your Profile"
          description="Add your preferred pronouns, any allergies or dietary requirements and choose a photo to represent yourself"
          buttonText="Edit"
          buttonTo={getProfileUrl("")}
          added={added.profile}
        />
        <Tile
          title="Add Experiences"
          description="Tell us what you’re good at, so we can match you with like-minded teammates!"
          buttonText="Fill In"
          buttonTo={getProfileUrl("/experience")}
          added={added.experience}
        />
        <Tile
          title="Complete Preferences"
          description="Let us know who you do or do not want to be matched with! Other students won’t see your preferences."
          buttonText="Complete"
          buttonTo={getProfileUrl("/preferences")}
          added={added.preference}
        />
      </div>
      <Stack justifyContent="center">
        <Button
          disabled={isAfterCutoffDate(cutoffDate) || completed < 3}
          onClick={handleContestRegistration}
          sx={{
            ...enrolBtn,
            "&:disabled": {
              backgroundColor: "#cccccc",
              color: "#888888",
              cursor: "not-allowed",
            },
          }}
        >
          {isAfterCutoffDate(cutoffDate)
            ? "Registration is now closed"
            : "Enrol for team"}
        </Button>
      </Stack>
    </>
  );
};

export default TeamRegistration;
