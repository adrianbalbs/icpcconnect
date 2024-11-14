import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { Box, Stack, TextField } from "@mui/material";
import styles from "@/styles/Experience.module.css";
import { preferenceInput } from "@/styles/sxStyles";

interface PairProps {
  setDisable: Dispatch<SetStateAction<boolean>>;
  alert: boolean;
  setPref: Dispatch<SetStateAction<string>>;
}

const PairInput = ({ setDisable, alert, setPref }: PairProps) => {
  const [teammate, setTeammate] = useState("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setTeammate(e.target.value);
  };

  useEffect(() => {
    setDisable(teammate === "");
    setPref(teammate);
  }, [teammate]);

  return (
    <Box sx={{ m: "30px 35px", width: "calc(100% - 70px)" }}>
      <Stack
        spacing={4}
        direction="row"
        sx={{ alignItems: "center", justifyContent: "center" }}
      >
        <p className={styles.language}>Teammate:</p>
        <TextField
          name="teammate"
          placeholder="Enter Student ID"
          value={teammate}
          sx={preferenceInput}
          onChange={handleChange}
          disabled={alert}
        />
      </Stack>
    </Box>
  );
};

export default PairInput;