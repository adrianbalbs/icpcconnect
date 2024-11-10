import axios from "axios";
import { useEffect, useState } from "react";
import { SERVER_URL } from "@/utils/constants";
import pageStyles from "@/styles/Page.module.css";
import teamStyles from "@/styles/Teams.module.css";
import Tile from "./Tile";
import { getInfo } from "@/utils/profileInfo";
import WaitingScreen from "../teams/WaitingScreen";
import { useAuth } from "../AuthProvider/AuthProvider";

const TeamRegistration = () => {
  const [completed, setCompleted] = useState(0);
  const [added, setAdded] = useState({
    profile: false,
    experience: false,
    preference: false,
  });

  const {
    userSession: { id },
  } = useAuth();

  const checkProfile = async () => {
    try {
      const profile = await getInfo(id);
      if (profile && profile.editInfo.pronouns) {
        setAdded((prev) => ({ ...prev, profile: true }));
      }
    } catch (err) {
      console.log(`Check profile error: ${err}`);
    }
  };

  const checkExperience = async () => {
    try {
      await axios.get(`${SERVER_URL}/api/contest-registration/${id}`, {
        withCredentials: true,
      });
      setAdded((prev) => ({ ...prev, experience: true }));
    } catch (err) {
      console.log(`Check experience error: ${err}`);
    }
  };

  // const checkPreference = () => {
  //   setAdded({ ...added, preference: true });
  // }

  useEffect(() => {
    checkProfile();
    checkExperience();
  }, [id]);

  useEffect(() => {
    setCompleted(Object.values(added).filter((a) => a).length);
  }, [added]);
  const getProfileUrl = (path: string) => `/profile/${id}${path}`;

  if (completed < 3) {
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
        {/* <Button disabled={completed < 3} onClick={() => setEnrolled(!enrolled)} sx={{ m: '0 auto' }}>
        {enrolled ? 'Withdraw enrolment' : 'Enrol for team'}
      </Button> */}
      </>
    );
  } else {
    return <WaitingScreen />;
  }
};

export default TeamRegistration;
