import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Box, Stack, TextField } from '@mui/material';
import styles from '@/styles/Experience.module.css';
import { preferenceInput } from '@/styles/sxStyles';
import { Teammate } from '@/profile/[id]/preferences/page';

interface TeamProps {
  setDisable: Dispatch<SetStateAction<boolean>>;
  alert: boolean;
  setPref: Dispatch<SetStateAction<Teammate[]>>;
}

const TeamInput = ({ setDisable, alert, setPref }: TeamProps) => {
  const [teammates, setTeammates] = useState({ one: '', two: '' });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTeammates({ ...teammates, [e.target.name]: e.target.value });
  }

  useEffect(() => {
    setDisable(teammates.one === '' || teammates.two === '');
    setPref([
      { studentId: teammates.one, name: null },
      { studentId: teammates.two, name: null },
    ]);
  }, [teammates]);

  return (
    <Box sx={{ m: '30px 35px', width: 'calc(100% - 70px)' }}>
      <Stack spacing={4} direction="row" sx={{ alignItems: 'center', justifyContent: 'center', mb: '15px' }}>
        <p className={styles.language}>Teammate 1:</p>
        <TextField
          name="one"
          placeholder="Enter Student ID"
          value={teammates.one}
          sx={preferenceInput}
          onChange={handleChange}
          disabled={alert}
        />
      </Stack>
      <Stack spacing={4} direction="row" sx={{ alignItems: 'center', justifyContent: 'center' }}>
        <p className={styles.language}>Teammate 2:</p>
        <TextField
          name="two"
          placeholder="Enter Student ID"
          value={teammates.two}
          sx={preferenceInput}
          onChange={handleChange}
          disabled={alert}
        />
      </Stack>
    </Box>
  );
}

export default TeamInput;