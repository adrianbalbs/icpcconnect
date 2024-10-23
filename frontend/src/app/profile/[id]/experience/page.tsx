'use client';

import { useEffect, useState } from 'react';
import profileStyles from '@/styles/Profile.module.css';
import pageStyles from '@/styles/Page.module.css';
import ExperienceModal from '@/components/experience/ExperienceModal';

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
  coursesTaken: string[];
  cppExperience: string;
  javaExperience: string;
  level: string;
  leetcodeRating: number;
  pythonExperience: string;
  student: string;
}

export interface Languages {
  cExperience: string;
  cppExperience: string;
  javaExperience: string;
  pythonExperience: string;
}

const Experience: React.FC = () => {
  
  // const [languages, setLanguages] = useState<Languages>({
  //   cExperience: 'none',
  //   cppExperience: 'none',
  //   javaExperience: 'none',
  //   pythonExperience: 'none',
  // });
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


  useEffect(() => {

  }, [added]);

  return (
    <div className={profileStyles['inner-screen']}>
      <div className={profileStyles.title}>
        <h3>Experience</h3>
      </div>
      <hr className={pageStyles.divider}/>
      <ExperienceModal  added={added} setAdded={setAdded} experience={experience} setExperience={setExperience} />
    </div>
  );
}

export default Experience;
