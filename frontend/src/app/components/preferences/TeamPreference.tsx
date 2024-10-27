import pageStyles from '@/styles/Page.module.css';
import experienceStyles from '@/styles/Experience.module.css';
import { experienceHeading } from '@/styles/sxStyles';
import { Box, Typography } from '@mui/material';
import { Teammate } from '@/profile/[id]/preferences/page';

interface TeamProps {
  teammates: Teammate[];
}

const TeamPreference = ({ teammates }: TeamProps) => {
  return (
    <>
      <h3 className={experienceStyles.heading}>Team Preference</h3>
      <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 3fr', alignItems: 'center', m: '10px 40px 13px' }}>
        <Typography sx={experienceHeading}>Student Id</Typography>
        <Typography sx={experienceHeading}>Student Name</Typography>
      </Box>
      <hr className={pageStyles.divider} />
      <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 3fr', alignItems: 'center', m: '20px 40px' }}>
        <Typography sx={{ fontSize: '14px' }}>{teammates[0].studentId}</Typography>
        <Typography sx={{ fontSize: '14px' }}>{teammates[0].name ?? '(Not registered yet)'}</Typography>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 3fr', alignItems: 'center', m: '20px 40px' }}>
        <Typography sx={{ fontSize: '14px' }}>{teammates[1].studentId}</Typography>
        <Typography sx={{ fontSize: '14px' }}>{teammates[1].name ?? '(Not registered yet)'}</Typography>
      </Box>
      <hr className={experienceStyles.divider}/>
    </>
  );
}

export default TeamPreference;