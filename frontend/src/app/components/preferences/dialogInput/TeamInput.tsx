import { ChangeEvent, useEffect, useState } from "react";
import { modalInputBox } from "@/styles/sxStyles";
import { Box } from "@mui/material";
import ModalInput from "@/components/utils/ModalInput";

interface TeamProps {
  setDisable: (disable: boolean) => void;
  alert: boolean;
  setPref: (pref: string) => void;
}

/**
 * Add Team component
 * - renders input to add two teammates by their student id's
 */
const TeamInput = ({ setDisable, alert, setPref }: TeamProps) => {
  const [teammates, setTeammates] = useState({ one: "", two: "" });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setTeammates({ ...teammates, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    setDisable(teammates.one === "" || teammates.two === "");
    setPref(`${teammates.one}, ${teammates.two}`);
  }, [teammates]);

  return (
    <Box sx={modalInputBox}>
      <ModalInput
        label="Teammate 1:"
        name="one"
        placeholder="Enter Student ID"
        value={teammates.one}
        handleChange={handleChange}
        disabled={alert}
        gap={"15px"}
      />
      <ModalInput
        label="Teammate 2:"
        name="two"
        placeholder="Enter Student ID"
        value={teammates.two}
        handleChange={handleChange}
        disabled={alert}
      />
    </Box>
  );
};

export default TeamInput;
