import { ChangeEvent, useEffect, useState } from "react";
import { modalInputBox } from "@/styles/sxStyles";
import { Box } from "@mui/material";
import ModalInput from "@/components/utils/ModalInput";

interface PairProps {
  setDisable: (disable: boolean) => void;
  alert: boolean;
  setPref: (pref: string) => void;
}

/**
 * Add Pair component
 * - renders input to add new teammate preference by student id
 */
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
    <Box sx={modalInputBox}>
      <ModalInput
        label="Teammate:"
        name="teammate"
        placeholder="Enter Student ID"
        value={teammate}
        handleChange={handleChange}
        disabled={alert}
      />
    </Box>
  );
};

export default PairInput;
