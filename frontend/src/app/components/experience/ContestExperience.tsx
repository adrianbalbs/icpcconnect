import pageStyles from "@/styles/Page.module.css";
import experienceStyles from "@/styles/Experience.module.css";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import PublicIcon from "@mui/icons-material/Public";
import TerminalIcon from "@mui/icons-material/Terminal";
import { List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Experiences, ExperienceType } from "@/profile/[id]/experience/page";
import { useEffect, useState } from "react";
import DeleteBtn from "../utils/DeleteBtn";
import axios from "axios";
import { SERVER_URL } from "@/utils/constants";
import {
  experienceIcon,
  experienceItem,
  experienceItemText,
} from "@/styles/sxStyles";

interface ContestProps {
  id: string;
  added: ExperienceType;
  experience: Experiences;
  update: () => Promise<void>;
  setMsg: (msg: string) => void;
}

/**
 * Render Contest Experience component
 * - renders the added contest experiences on page as list
 * - includes:
 *    - number of past contests
 *    - leetcode / codeforces rating
 */
const ContestExperience = ({
  id,
  added,
  experience,
  update,
  setMsg,
}: ContestProps) => {
  const [contestAdded, setContestAdded] = useState({
    codeforcesRating: false,
    contestExperience: false,
    leetcodeRating: false,
  });

  const [contestExp, setContestExp] = useState({
    codeforcesRating: 0,
    contestExperience: 0,
    leetcodeRating: 0,
  });

  const remove = async (type: string) => {
    try {
      await axios.patch(
        `${SERVER_URL}/api/users/${id}/student-details`,
        { [type]: 0 },
        { withCredentials: true },
      );
      update();
      if (type.includes("Rating")) {
        const msg = type === "codeforcesRating" ? "Codeforces" : "LeetCode";
        setMsg(`${msg} Rating Deleted!`);
      } else {
        setMsg("Past Contest Experience Deleted!");
      }
    } catch (error) {
      console.log(`Delete ${type} experience error: ${error}`);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { coursesCompleted, language, ...contests } = added;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { codeforcesRating, contestExperience, leetcodeRating, ...other } =
      experience;
    setContestAdded(contests);
    setContestExp({ codeforcesRating, contestExperience, leetcodeRating });
  }, [added, experience]);

  return (
    <>
      <h3 className={experienceStyles.heading}>Competitive Experience</h3>
      <hr className={pageStyles.divider} />
      <List sx={{ m: "12px 32px 0 40px", p: 0 }}>
        {contestAdded.contestExperience && (
          <ListItem sx={experienceItem}>
            <ListItemIcon>
              <PublicIcon sx={experienceIcon} />
            </ListItemIcon>
            <ListItemText
              primary="Past Contest(s) Completed"
              sx={experienceItemText}
            />
            <div className={experienceStyles.numbers}>
              {contestExp.contestExperience}
            </div>
            <DeleteBtn
              id={id}
              handleDelete={() => remove("contestExperience")}
            />
          </ListItem>
        )}
        {contestAdded.leetcodeRating && (
          <ListItem sx={experienceItem}>
            <ListItemIcon>
              <TerminalIcon sx={experienceIcon} />
            </ListItemIcon>
            <ListItemText
              primary="LeetCode Contest Rating"
              sx={experienceItemText}
            />
            <div className={experienceStyles.numbers}>
              {contestExp.leetcodeRating}
            </div>
            <DeleteBtn id={id} handleDelete={() => remove("leetcodeRating")} />
          </ListItem>
        )}
        {contestAdded.codeforcesRating && (
          <ListItem sx={experienceItem}>
            <ListItemIcon>
              <LeaderboardIcon sx={experienceIcon} />
            </ListItemIcon>
            <ListItemText
              primary="Codeforces Contest Rating"
              sx={experienceItemText}
            />
            <div className={experienceStyles.numbers}>
              {contestExp.codeforcesRating}
            </div>
            <DeleteBtn
              id={id}
              handleDelete={() => remove("codeforcesRating")}
            />
          </ListItem>
        )}
      </List>
      <hr className={experienceStyles.divider} />
    </>
  );
};

export default ContestExperience;
