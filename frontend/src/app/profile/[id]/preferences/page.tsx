'use client';

import { useState } from 'react';
import profileStyles from '@/styles/Profile.module.css';
import experienceStyles from '@/styles/Experience.module.css';
import { ProfileProps } from '../page';
import { Box } from '@mui/material';
import PreferenceModal from '@/components/preferences/PreferenceModal';
import PairPreference from '@/components/preferences/PairPreference';
import TeamPreference from '@/components/preferences/TeamPreference';
import ExclusionPreference from '@/components/preferences/ExclusionPreference';

export interface PreferenceType {
  team: boolean;
  pair: boolean;
  exclusions: boolean;
}

export interface Teammate {
  studentId: string;
  name: string | null;
}

export interface PreferenceInput {
  team: Teammate[];
  pair: Teammate;
  exclusions: string[];
}

const Preferences: React.FC<ProfileProps> = ({ params }) => {
  console.log(params);
  const [added, setAdded] = useState<PreferenceType>({
    team: false,
    pair: false,
    exclusions: false,
  })
  const [preferences, setPreferences] = useState<PreferenceInput>({
    team: [
      { studentId: '', name: null },
      { studentId: '', name: null },
    ],
    pair: { studentId: '', name: null },
    exclusions: []
  });

  const deletePreference = (type: string) => {
    if (type === 'team') {
      setAdded({ ...added, team: false });
      setPreferences({ ...preferences, team: [
          { studentId: '', name: null },
          { studentId: '', name: null },
        ]
      });
    } else if (type === 'pair') {
      setAdded({ ...added, pair: false });
      setPreferences({ ...preferences, pair: { studentId: '', name: null } });
    } else {
      const newList = preferences.exclusions.filter(e => e !== type);
      newList.length === 0 && setAdded({ ...added, exclusions: false });
      setPreferences({ ...preferences, exclusions: newList });
    }
  }

  return (
    <div className={profileStyles['inner-screen']}>
      <div className={profileStyles.title}>
        <h3>Preferences</h3>
      </div>
      <hr className={experienceStyles.divider}/>
      <Box sx={{ height: 'calc(100% - 121px)', overflow: 'scroll' }}>
        {added.team && <TeamPreference teammates={preferences.team} deletePreference={deletePreference} />}
        {added.pair && <PairPreference { ...preferences.pair } deletePreference={deletePreference} />}
        {added.exclusions && <ExclusionPreference students={preferences.exclusions} />}
        <PreferenceModal added={added} setAdded={setAdded} preferences={preferences} setPreferences={setPreferences} />
      </Box>
    </div>
  );
}

export default Preferences;
