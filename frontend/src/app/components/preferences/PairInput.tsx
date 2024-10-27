import { ChangeEvent, useState } from 'react';
import { Box, Stack, TextField } from '@mui/material';
import styles from '@/styles/Experience.module.css';
import { preferenceInput } from '@/styles/sxStyles';

const PairInput = () => {
  const [teammate, setTeammate] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTeammate(e.target.value);
  }

  return (
    <Box sx={{ m: '30px 35px', width: 'calc(100% - 70px)' }}>
      <Stack spacing={4} direction="row" sx={{ alignItems: 'center', justifyContent: 'center' }}>
        <p className={styles.language}>Teammate:</p>
        <TextField
          name="teammate"
          placeholder="Enter Student ID"
          value={teammate}
          sx={preferenceInput}
          onChange={handleChange}
        />
      </Stack>
    </Box>
  );
}

export default PairInput;