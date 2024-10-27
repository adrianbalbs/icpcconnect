'use client';

import { useEffect, useState } from 'react';
import profileStyles from '@/styles/Profile.module.css';
import experienceStyles from '@/styles/Experience.module.css';
import { ProfileProps } from '../page';
import { Box } from '@mui/material';
import PreferenceModal from '@/components/preferences/PreferenceModal';

export interface PreferenceType {
  team: boolean;
  pair: boolean;
  exclusions: boolean;
}

const Preferences: React.FC<ProfileProps> = ({ params }) => {
  const [added, setAdded] = useState<PreferenceType>({
    team: false,
    pair: false,
    exclusions: false,
  })
  const [team, setTeam] = useState([
    { studentId: '', name: '' },
    { studentId: '', name: '' },
  ]);
  const [pair, setPair] = useState({ studentId: '', name: '' });
  const [exclusions, setExclusions] = useState<string[]>([]);

  return (
    <div className={profileStyles['inner-screen']}>
      <div className={profileStyles.title}>
        <h3>Preferences</h3>
      </div>
      <hr className={experienceStyles.divider}/>
      <Box sx={{ height: 'calc(100% - 121px)', overflow: 'scroll' }}>
        <PreferenceModal  added={added} setAdded={setAdded} />
      </Box>
    </div>
  );
}

export default Preferences;
