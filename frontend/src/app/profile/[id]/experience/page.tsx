'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { SERVER_URL } from '@/utils/constants';
import profileStyles from '@/styles/Profile.module.css';
import experienceStyles from '@/styles/Experience.module.css';
import { Box } from '@mui/material';
import ExperienceModal from '@/components/experience/ExperienceModal';
import LanguageExperience from '@/components/experience/LanguageExperience';
import CoursesExperience from '@/components/experience/CoursesExperience';
import { ProfileProps } from '../page';
import ContestExperience from '@/components/experience/ContestExperience';

export interface ExperienceType {
  codeforcesRating: boolean;
  contestExperience: boolean;
  coursesTaken: boolean;
  language: boolean;
  leetcodeRating: boolean;
}

// TODO: Fix types
export interface Experiences {
  level: string;
  contestExperience: number;
  leetcodeRating: number;
  codeforcesRating: number;
  cppExperience: string;
  cExperience: string;
  javaExperience: string;
  pythonExperience: string;
  coursesCompleted: number[];
}

// student: string;
// level: Level;
// contestExperience: number;
// leetcodeRating: number;
// codeforcesRating: number;
// cppExperience: LanguageExperience;
// cExperience: LanguageExperience;
// javaExperience: LanguageExperience;
// pythonExperience: LanguageExperience;
// timeSubmitted: Date;
// coursesCompleted: Course[];

const Experience: React.FC<ProfileProps> = ({ params }) => {
  const [added, setAdded] = useState<ExperienceType>({
    codeforcesRating: false,
    contestExperience: false,
    coursesTaken: false,
    language: false,
    leetcodeRating: false,
  });

  const [experience, setExperience] = useState<Experiences>({
    level: '',
    contestExperience: 0,
    leetcodeRating: 0,
    codeforcesRating: 0,
    cppExperience: 'none',
    cExperience: 'none',
    javaExperience: 'none',
    pythonExperience: 'none',
    coursesCompleted: [],
  });

  const getExperience = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/contest-registration/${params.id}`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { student, timeSubmitted, ...newExperience } = res.data;
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
        {added.coursesTaken && <CoursesExperience coursesTaken={experience.coursesCompleted} />}
        {(added.contestExperience || added.leetcodeRating || added.codeforcesRating) &&
          <ContestExperience added={added} experience={experience} />
        }
        <ExperienceModal  added={added} setAdded={setAdded} experience={experience} setExperience={setExperience} />
      </Box>
    </div>
  );
}

export default Experience;
