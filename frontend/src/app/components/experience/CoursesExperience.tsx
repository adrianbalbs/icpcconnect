import { useEffect, useState } from "react";
import pageStyles from "@/styles/Page.module.css";
import experienceStyles from "@/styles/Experience.module.css";
import { Box, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import DeleteBtn from "../utils/DeleteBtn";
import axios from "axios";
import { SERVER_URL } from "@/utils/constants";
import { experienceIcon, experienceItemText } from "@/styles/sxStyles";

interface CourseProps {
  id: string;
  coursesTaken: number[];
  update: () => Promise<void>;
  setMsg: (msg: string) => void;
}

export const valueToText = [
  "Programming Fundamentals",
  "Data Structures and Algorithms",
  "Algorithmic Design",
  "Programming Challenges",
];

/**
 * Render Course Experience component
 * - renders relevant course experiences added on page as list
 * - includes:
 *    - programming fundamentals
 *    - data structures and algorithms
 *    - algorithmic design
 *    - programming challenges
 */
const CoursesExperience = ({
  id,
  coursesTaken,
  update,
  setMsg,
}: CourseProps) => {
  const [courses, setCourses] = useState<number[]>([]);

  const handleDelete = async () => {
    try {
      await axios.patch(
        `${SERVER_URL}/api/users/${id}/student-details`,
        { coursesCompleted: [] },
        { withCredentials: true },
      );
      update();
      setMsg("Courses Experience Deleted!");
    } catch (error) {
      console.log(`Delete course experience error: ${error}`);
    }
  };

  useEffect(() => {
    const sorted = [...coursesTaken];
    sorted.sort((a, b) => a - b);
    setCourses(sorted);
  }, [coursesTaken]);

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          m: "0 32px 10px 0",
        }}
      >
        <h3 className={experienceStyles.heading}>Relevant Courses</h3>
        <Box sx={{ placeSelf: "end" }}>
          <DeleteBtn id={id} handleDelete={handleDelete} />
        </Box>
      </Box>
      <hr className={pageStyles.divider} />
      <List sx={{ m: "12px 40px 0", p: 0, width: "100%", maxWidth: 360 }}>
        {courses.map((c) => (
          <ListItem key={c} sx={{ padding: "5px" }}>
            <ListItemIcon>
              <SchoolRoundedIcon sx={experienceIcon} />
            </ListItemIcon>
            <ListItemText
              primary={valueToText[c - 1]}
              sx={experienceItemText}
            />
          </ListItem>
        ))}
      </List>
      <hr className={experienceStyles.divider} />
    </>
  );
};

export default CoursesExperience;
