import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import styles from '@/styles/Experience.module.css';
import { Box, Checkbox, FormControl, FormControlLabel, FormGroup } from '@mui/material';
import { Experiences } from '@/profile/[id]/experience/page';

interface CheckboxProps {
  setDisable: Dispatch<SetStateAction<boolean>>;
  experience: Experiences;
  setExperience: Dispatch<SetStateAction<Experiences>>;
}

const CourseCheckbox: React.FC<CheckboxProps> = ({ setDisable, experience, setExperience }) => {
  const [courses, setCourses] = useState({ 1: false, 2: false, 3: false, 4: false });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const course = Number(event.target.name);
    setCourses({ ...courses, [course]: event.target.checked });

    // Attempt to filter out course regardless of adding or removing (avoid duplicates)
    const coursesCompleted = experience.coursesCompleted.filter(i => i !== course);
    if (event.target.checked) coursesCompleted.push(course);
    setExperience({ ...experience, coursesCompleted });
  }

  useEffect(() => {
    setDisable(!Object.values(courses).includes(true));
  }, [courses]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mb: '20px' }}>
      <p className={styles.question}>What relevant courses have you completed?</p>
      <FormControl sx={{ alignSelf: 'center' }} component="fieldset" variant="standard">
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox checked={courses['1']} onChange={handleChange} name="1" />
            }
            label={<span className={styles['checkbox-label']}>Introduction to Programming</span>}
          />
          <FormControlLabel
            control={
              <Checkbox checked={courses['2']} onChange={handleChange} name="2" />
            }
            label={<span className={styles['checkbox-label']}>Data Structures and Algorithms</span>}
          />
          <FormControlLabel
            control={
              <Checkbox checked={courses['3']} onChange={handleChange} name="3" />
            }
            label={<span className={styles['checkbox-label']}>Algorithmic Design</span>}
          />
          <FormControlLabel
            control={
              <Checkbox checked={courses['4']} onChange={handleChange} name="4" />
            }
            label={<span className={styles['checkbox-label']}>Programming Challenges</span>}
          />
        </FormGroup>
      </FormControl>
    </Box>
  )
}

export default CourseCheckbox;