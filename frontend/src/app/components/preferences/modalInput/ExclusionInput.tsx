import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Box, Stack, TextField } from '@mui/material';
import styles from '@/styles/Experience.module.css';
import { preferenceInput } from '@/styles/sxStyles';
import { PreferenceInput } from '@/profile/[id]/preferences/page';

interface ExclusionProps {
  setDisable: Dispatch<SetStateAction<boolean>>;
  pref: PreferenceInput;
  setPref: Dispatch<SetStateAction<PreferenceInput>>;
}

const ExclusionInput = ({ setDisable, pref, setPref }: ExclusionProps) => {
  const [student, setStudent] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setStudent(e.target.value);
  }

  useEffect(() => {
    setDisable(student === '');
    if (student) {
      setPref({ ...pref, exclusions: [ ...pref.exclusions, student ] });
    }
  }, [student]);

  return (
    <Box sx={{ m: '30px 35px', width: 'calc(100% - 70px)' }}>
      <Stack spacing={4} direction="row" sx={{ alignItems: 'center', justifyContent: 'center' }}>
        <p className={styles.language}>Student:</p>
        <TextField
          name="student"
          placeholder="Enter name to exclude"
          value={student}
          sx={preferenceInput}
          onChange={handleChange}
        />
      </Stack>
    </Box>
  );
}

export default ExclusionInput;
