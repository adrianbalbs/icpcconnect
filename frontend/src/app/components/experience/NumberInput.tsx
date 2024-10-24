import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import styles from '@/styles/Experience.module.css';
import { Box, Input, Stack } from "@mui/material";

interface InputProps {
  type: number;
  setDisable: Dispatch<SetStateAction<boolean>>;
};

const typeToQuestion = [
  'How many contests have you participated in previously?',
  'What is your LeetCode contest rating?',
  'What is your Codeforces contest rating?'
]

const NumberInput: React.FC<InputProps> = ({ type, setDisable }) => {
  const [value, setValue] = useState<string>('0');

  const assertPositive = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    if (newValue === '' || /^[0-9]*$/.test(newValue)) {
      setValue(newValue);
    }
  }

  useEffect(() => {
    setDisable(Number(value) === 0);
  }, [value]);

  return (
    <Box sx={{ m: '30px 35px', w: 'calc(100% - 70px)' }}>
      <Stack spacing={4} direction="row" sx={{ alignItems: 'center', justifyContent: 'center' }}>
        <p className={styles.language}>{typeToQuestion[type]}</p>
        <Input
          type="number"
          value={value}
          sx={{ pl: '5px', w: '91px', color: 'grey' }}
          onChange={assertPositive}
        />
      </Stack>
    </Box>
  );
}

export default NumberInput;