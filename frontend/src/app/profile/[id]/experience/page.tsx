'use client';

import { useEffect, useState } from 'react';
import profileStyles from '@/styles/Profile.module.css';
import experienceStyles from '@/styles/Experience.module.css';
import ExperienceModal from '@/components/experience/ExperienceModal';
import LanguageExperience from '@/components/experience/LanguageExperience';
import CoursesExperience from '@/components/experience/CoursesExperience';
import { ProfileProps } from '../page';
import axios from 'axios';
import { SERVER_URL } from '@/utils/constants';
import { Box } from '@mui/material';

export interface ExperienceType {
  codeforcesRating: boolean;
  contestExperience: boolean;
  coursesTaken: boolean;
  language: boolean;
  leetcodeRating: boolean;
}

// TODO: Fix types
export interface Experiences {
  cExperience: string;
  codeforcesRating: number;
  contestExperience: number;
  coursesTaken: number[];
  cppExperience: string;
  javaExperience: string;
  level: string;
  leetcodeRating: number;
  pythonExperience: string;
  student: string;
}

const Experience: React.FC<ProfileProps> = ({ params }) => {
  const [added, setAdded] = useState<ExperienceType>({
    codeforcesRating: false,
    contestExperience: false,
    coursesTaken: false,
    language: false,
    leetcodeRating: false,
  });

  const [experience, setExperience] = useState<Experiences>({
    cExperience: 'none',
    codeforcesRating: 0,
    contestExperience: 0,
    coursesTaken: [],
    cppExperience: 'none',
    javaExperience: 'none',
    level: '',
    leetcodeRating: 0,
    pythonExperience: 'none',
    student: '',
  });

  const getExperience = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/contest-registration/${params.id}`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { student, ...newExperience } = res.data;
      // setExperience(newExperience);
    } catch (error) {
      console.log(`Get experience error: ${error}`);
    }
  }

  const updateExperience = async () => {
    try {
      await axios.put(`${SERVER_URL}/api/contest-registration/${params.id}`, experience);
    } catch (error) {
      console.log(`Update experience error: ${error}`);
    }
  }

  useEffect(() => {
    getExperience();
  }, []);

  useEffect(() => {
    updateExperience();
  }, [added]);

  return (
    <div className={profileStyles['inner-screen']}>
      <div className={profileStyles.title}>
        <h3>Experience</h3>
      </div>
      <hr className={experienceStyles.divider}/>
      <Box sx={{ height: 'calc(100% - 121px)', overflow: 'scroll' }}>
        {added.language && <LanguageExperience { ...experience } />}
        {added.coursesTaken && <CoursesExperience coursesTaken={experience.coursesTaken} />}
        <ExperienceModal  added={added} setAdded={setAdded} experience={experience} setExperience={setExperience} />
      </Box>
    </div>
  );
}

export default Experience;
