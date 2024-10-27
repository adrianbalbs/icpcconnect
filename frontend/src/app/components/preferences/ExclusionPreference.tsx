import pageStyles from '@/styles/Page.module.css';
import experienceStyles from '@/styles/Experience.module.css';
import { experienceHeading } from '@/styles/sxStyles';
import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

const ExclusionPreference = ({ students }: { students: string[] }) => {
  const [studentString, setStudentString] = useState('');

  useEffect(() => {
    setStudentString(students.join(', '));
  }, [students]);

  return (
    <>
      <h3 className={experienceStyles.heading}>Exclusion Preference</h3>
      <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 3fr', alignItems: 'center', m: '10px 40px 13px' }}>
        <Typography sx={experienceHeading}>Student Names</Typography>
      </Box>
      <hr className={pageStyles.divider} />
      <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 3fr', alignItems: 'center', m: '20px 40px' }}>
        <Typography sx={{ fontSize: '14px' }}>{studentString}</Typography>
      </Box>
      <hr className={experienceStyles.divider}/>
    </>
  );
}

export default ExclusionPreference;