import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { SERVER_URL } from "@/utils/constants";
import pageStyles from "@/styles/Page.module.css";
import teamStyles from "@/styles/Teams.module.css";
import Tile from "./Tile";
import { getInfo } from "@/utils/profileInfo";
import { useAuth } from "../AuthProvider/AuthProvider";
import { Button, Stack } from "@mui/material";
import { User } from "@/types/users";
import { enrolBtn } from "@/styles/sxStyles";

type TeamRegistrationProps = {
  contestId: string;
  fetchEnrollment: () => void;
};

const TeamRegistration: React.FC<TeamRegistrationProps> = ({
  contestId,
  fetchEnrollment,
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
    } catch (err) {
      console.error(err);
    }
  };

  // const checkPreference = () => {
  //   setAdded({ ...added, preference: true });
  // }

  useEffect(() => {
    const fetchInitialData = async () => {
      await Promise.all([checkProfile(), checkExperience()]);
    };

    fetchInitialData();
  }, [checkProfile, checkExperience]);

  useEffect(() => {
    setCompleted(Object.values(added).filter((a) => a).length);
  }, [added]);
  const getProfileUrl = (path: string) => `/profile/${id}${path}`;

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
      {/* TODO: Once preferences is merged, have disabled state linked to completed tasks */}
      <Stack justifyContent="center">
        <Button
          disabled={false}
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
          Enrol for team
        </Button>
      </Stack>
    </>
  );
};

export default TeamRegistration;
