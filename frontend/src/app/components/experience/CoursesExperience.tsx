import { useEffect, useState } from 'react';
import pageStyles from '@/styles/Page.module.css';
import experienceStyles from '@/styles/Experience.module.css';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';

const valueToText = [
  'Introduction to Programming',
  'Data Structures and Algorithms',
  'Algorithmic Design',
  'Programming Challenges'
];

const CoursesExperience = ({ coursesTaken }: { coursesTaken: number[] }) => {
  const [courses, setCourses] = useState<number[]>([]);

  useEffect(() => {
    const sorted = [ ...coursesTaken ];
    sorted.sort((a, b) => a - b);
    setCourses(sorted);
  }, [coursesTaken]);

  return (
    <>
      <h3 className={experienceStyles.heading}>Relevant Courses</h3>
      <hr className={pageStyles.divider} />
      <List sx={{ m: '12px 40px 0', p: 0, width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
        {courses.map(c => 
          <ListItem sx={{ padding: '5px' }}>
            <ListItemIcon sx={{ color: '#444444' }}><SchoolRoundedIcon /></ListItemIcon>
            <ListItemText primary={valueToText[c - 1]} sx={{ fontSize: '14px', color: '#333333' }} />
          </ListItem>
        )}
      </List>
      <hr className={experienceStyles.divider}/>
    </>
  );
}

export default CoursesExperience;