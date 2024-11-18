import { useEffect, useState } from "react";
import { modalInputBox } from "@/styles/sxStyles";
import { Box } from "@mui/material";
import ModalInput from "@/components/utils/ModalInput";

interface ExclusionProps {
  setDisable: (disable: boolean) => void;
  setPref: (pref: string) => void;
}

/**
 * Add Exclusion component
 * - renders input to add new student exclusion
 */
const ExclusionInput = ({ setDisable, setPref }: ExclusionProps) => {
  const [student, setStudent] = useState("");

  useEffect(() => {
    setDisable(student === "");
    setPref(student);
  }, [student]);

  return (
    <Box sx={modalInputBox}>
      <ModalInput
        label="Student:"
        placeholder="Enter name to exclude"
        value={student}
        handleChange={(e) => setStudent(e.target.value)}
      />
    </Box>
  );
};

export default ExclusionInput;
