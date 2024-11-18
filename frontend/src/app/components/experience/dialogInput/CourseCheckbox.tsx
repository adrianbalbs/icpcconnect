import { Dispatch, SetStateAction, useEffect, useState } from "react";
import styles from "@/styles/Experience.module.css";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import { Experiences } from "@/profile/[id]/experience/page";
import { valueToText } from "../CoursesExperience";

interface CheckboxProps {
  setDisable: Dispatch<SetStateAction<boolean>>;
  experience: Experiences;
  setExperience: Dispatch<SetStateAction<Experiences>>;
}

/**
 * Add Course Experience component
 * - renders a checkbox selection for relevant course experience
 */
const CourseCheckbox: React.FC<CheckboxProps> = ({
  setDisable,
  experience,
  setExperience,
}) => {
  const [courses, setCourses] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const course = Number(event.target.name);
    setCourses({ ...courses, [course]: event.target.checked });

    // Attempt to filter out course regardless of adding or removing (avoid duplicates)
    const coursesCompleted = experience.coursesCompleted.filter(
      (i) => i !== course,
    );
    if (event.target.checked) coursesCompleted.push(course);
    setExperience({ ...experience, coursesCompleted });
  };

  useEffect(() => {
    setCourses({
      1: experience.coursesCompleted.includes(1),
      2: experience.coursesCompleted.includes(2),
      3: experience.coursesCompleted.includes(3),
      4: experience.coursesCompleted.includes(4),
    });
  }, []);

  useEffect(() => {
    setDisable(!Object.values(courses).includes(true));
  }, [courses]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", mb: "20px" }}>
      <p className={styles.question}>
        What relevant courses have you completed?
      </p>
      <FormControl
        sx={{ alignSelf: "center" }}
        component="fieldset"
        variant="standard"
      >
        <FormGroup>
          {Object.entries(courses).map(([id, isAdded]) => (
            <FormControlLabel
              key={id}
              control={
                <Checkbox checked={isAdded} onChange={handleChange} name={id} />
              }
              label={
                <span className={styles["checkbox-label"]}>
                  {valueToText[Number(id) - 1]}
                </span>
              }
            />
          ))}
        </FormGroup>
      </FormControl>
    </Box>
  );
};

export default CourseCheckbox;
