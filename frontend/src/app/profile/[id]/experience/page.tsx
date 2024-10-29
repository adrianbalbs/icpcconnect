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
  coursesTaken: number[];
}

const Experience: React.FC<ProfileProps> = ({ params }) => {
  // States key
  // 0: db does not have record of user registration
  // 1: user registration record is in db
  // 2: page is rendered
  const [state, setState] = useState(0);

  // Object containing types of experiences added to page
  const [added, setAdded] = useState<ExperienceType>({
    codeforcesRating: false,
    contestExperience: false,
    coursesTaken: false,
    language: false,
    leetcodeRating: false,
  });

  const [experience, setExperience] = useState<Experiences>({
    level: 'A',
    contestExperience: 0,
    leetcodeRating: 0,
    codeforcesRating: 0,
    cppExperience: 'none',
    cExperience: 'none',
    javaExperience: 'none',
    pythonExperience: 'none',
    coursesTaken: [],
  });

  const createRegistration = async () => {
    try {
      await axios.post(`${SERVER_URL}/api/contest-registration`, { student: params.id, ...experience });
    } catch (err) {
      console.log(`Create registration error: ${err}`);
    }
  }

  const renderPage = () => {
    setAdded({
      codeforcesRating: experience.codeforcesRating > 0,
      contestExperience: experience.contestExperience > 0,
      coursesTaken: experience.coursesTaken.length > 0,
      language: false,
      leetcodeRating: experience.leetcodeRating > 0,
    });
  }

  const getExperience = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/contest-registration/${params.id}`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { student, timeSubmitted, coursesCompleted, ...newExperience } = res.data;
      console.log(res.data);
      setExperience({ ...newExperience, coursesTaken: coursesCompleted });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 404) {
          createRegistration();
        } else {
          console.log(`Get experience error: ${err}`);
        }
      } else {
        console.log(`Unexpected get experience error: ${err}`);
      }
    }
    if (state === 0) setState(1);
  }

  useEffect(() => {
    if (state === 1) {
      renderPage();
      setState(2);
    }
  }, [state]);

  useEffect(() => {
    getExperience();
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
        {(added.contestExperience || added.leetcodeRating || added.codeforcesRating) &&
          <ContestExperience added={added} experience={experience} />
        }
        <ExperienceModal id={params.id} added={added} setAdded={setAdded} experience={experience} />
      </Box>
    </div>
  );
}

export default Experience;
