import axios from "axios";
import { useEffect, useState } from "react";
import pageStyles from "@/styles/Page.module.css";
import experienceStyles from "@/styles/Experience.module.css";
import { experienceHeading } from "@/styles/sxStyles";
import { Box, Typography } from "@mui/material";
import LanguageProficiency from "./LanguageProficiency";
import { Experiences } from "@/profile/[id]/experience/page";
import DeleteBtn from "../utils/DeleteBtn";
import { SERVER_URL } from "@/utils/constants";

interface LanguageProps extends Experiences {
  id: string;
  update: () => Promise<void>;
  setMsg: (msg: string) => void;
}

/**
 * Render Language Experience component
 * - renders language proficiency experiences on page
 * - languages include:
 *    - c, cpp, java, python
 * - proficiencies include:
 *    - none, some, prof
 */
const LanguageExperience = (props: LanguageProps) => {
  const [languages, setLanguages] = useState({
    c: "none",
    cpp: "none",
    java: "none",
    python: "none",
  });

  const handleDelete = async () => {
    try {
      await axios.patch(
        `${SERVER_URL}/api/users/${props.id}/student-details`,
        {
          cExperience: "none",
          cppExperience: "none",
          javaExperience: "none",
          pythonExperience: "none",
        },
        { withCredentials: true },
      );
      props.update();
      props.setMsg("Programming Language Experience Deleted!");
    } catch (error) {
      console.log(`Delete language experience error: ${error}`);
    }
  };

  useEffect(() => {
    setLanguages({
      c: props.cExperience,
      cpp: props.cppExperience,
      java: props.javaExperience,
      python: props.pythonExperience,
    });
    console.log(props);
  }, [props]);

  return (
    <>
      <h3 className={experienceStyles.heading}>
        Programming Language Experience
      </h3>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "4fr 16fr 1fr",
          alignItems: "center",
          m: "10px 32px 13px 40px",
        }}
      >
        <Typography sx={experienceHeading}>Language</Typography>
        <Typography sx={experienceHeading}>Proficiency</Typography>
        <DeleteBtn id={props.id} handleDelete={handleDelete} />
      </Box>
      <hr className={pageStyles.divider} />
      <LanguageProficiency language="C" proficiency={languages.c} />
      <LanguageProficiency language="C++" proficiency={languages.cpp} />
      <LanguageProficiency language="Java" proficiency={languages.java} />
      <LanguageProficiency language="Python" proficiency={languages.python} />
      <hr className={experienceStyles.divider} />
    </>
  );
};

export default LanguageExperience;
