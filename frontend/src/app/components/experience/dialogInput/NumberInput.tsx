import { Dispatch, SetStateAction, useEffect, useState } from "react";
import styles from "@/styles/Experience.module.css";
import { Box, Input, Stack } from "@mui/material";
import { Experiences } from "@/profile/[id]/experience/page";

interface InputProps {
  type: number;
  setDisable: Dispatch<SetStateAction<boolean>>;
  experience: Experiences;
  setExperience: Dispatch<SetStateAction<Experiences>>;
}

const typeToString = [
  "contestExperience",
  "leetcodeRating",
  "codeforcesRating",
];

const typeToQuestion = [
  "How many contests have you participated in previously?",
  "What is your LeetCode contest rating?",
  "What is your Codeforces contest rating?",
];

/**
 * Add Contest/Rating Experience component
 * - renders a numbered input for past contests and leetcode/codeforces rating
 */
const NumberInput: React.FC<InputProps> = ({
  type,
  setDisable,
  experience,
  setExperience,
}) => {
  const [value, setValue] = useState("0");

  const assertPositive = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    if ((input === "" || /^[0-9]*$/.test(input)) && Number(input) < 10000) {
      setValue(input);
    }
  };

  useEffect(() => {
    setValue(experience[typeToString[type] as keyof Experiences].toString());
  }, []);

  useEffect(() => {
    setDisable(Number(value) <= 0);
    setExperience({ ...experience, [typeToString[type]]: Number(value) });
  }, [value]);

  return (
    <Box sx={{ m: "30px 35px", width: "calc(100% - 70px)" }}>
      <Stack
        spacing={4}
        direction="row"
        sx={{ alignItems: "center", justifyContent: "center" }}
      >
        <p className={styles.language}>{typeToQuestion[type]}</p>
        <Input
          type="number"
          value={value}
          sx={{ pl: "5px", width: "91px", color: "grey" }}
          onChange={assertPositive}
        />
      </Stack>
    </Box>
  );
};

export default NumberInput;
