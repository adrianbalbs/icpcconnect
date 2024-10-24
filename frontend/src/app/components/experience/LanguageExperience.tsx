import { useEffect, useState } from 'react';
import pageStyles from '@/styles/Page.module.css';
import experienceStyles from '@/styles/Experience.module.css';
import { experienceHeading } from '@/styles/sxStyles';
import { Box, Typography } from '@mui/material';
import LanguageProficiency from './LanguageProficiency';
import { Experiences } from '@/profile/[id]/experience/page';

const LanguageExperience = (props: Experiences) => {
  const [languages, setLanguages] = useState({
    c: 'none',
    cpp: 'none',
    java: 'none',
    python: 'none'
  });

  useEffect(() => {
    setLanguages({
      c: props.cExperience,
      cpp: props.cppExperience,
      java: props.javaExperience,
      python: props.pythonExperience
    });
    console.log(props);
  }, [props]);

  return (
    <>
      <h3 className={experienceStyles.heading}>Programming Language Experience</h3>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 4fr', alignItems: 'center', m: '10px 40px 13px' }}>
        <Typography sx={experienceHeading}>Language</Typography>
        <Typography sx={experienceHeading}>Proficiency</Typography>
      </Box>
      <hr className={pageStyles.divider} />
      <LanguageProficiency language="C" proficiency={languages.c} />
      <LanguageProficiency language="C++" proficiency={languages.cpp} />
      <LanguageProficiency language="Java" proficiency={languages.java} />
      <LanguageProficiency language="Python" proficiency={languages.python} />
      <hr className={experienceStyles.divider}/>
    </>
  );
}

export default LanguageExperience;