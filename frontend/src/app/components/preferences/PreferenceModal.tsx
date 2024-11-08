import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { capitalise } from "@/utils/profileInfo";
import { addBtn, addExperienceBtn, addModal } from "@/styles/sxStyles";
import pageStyles from "@/styles/Page.module.css";
import experienceStyles from "@/styles/Experience.module.css";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import CloseBtn from "../utils/CloseBtn";
import { PreferenceType, Teammate } from "@/profile/[id]/preferences/page";
import TeamInput from "./modalInput/TeamInput";
import PairInput from "./modalInput/PairInput";
import ExclusionInput from "./modalInput/ExclusionInput";
import TeamPairAlert from "./modalInput/TeamPairAlert";
import { getPreferences, updatePreferences } from "@/utils/preferenceInfo";

interface ModalProps {
  id: string;
  added: PreferenceType;
  setAdded: Dispatch<SetStateAction<PreferenceType>>;
}

const PreferenceModal: React.FC<ModalProps> = ({ id, added, setAdded }) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [disable, setDisable] = useState(false);
  const [alert, setAlert] = useState({ old: "", curr: "" });
  const [team, setTeam] = useState<Teammate[]>([
    { studentId: "", name: null },
    { studentId: "", name: null },
  ]);
  const [pair, setPair] = useState<Teammate>({ studentId: "", name: null });
  const [exclude, setExclude] = useState("");

  const reset = () => {
    setAlert({ old: "", curr: "" });
    setTeam([
      { studentId: "", name: null },
      { studentId: "", name: null },
    ]);
    setPair({ studentId: "", name: null });
    setExclude("");
  };

  const checkExclusivity = (newType: string) => {
    if (newType === "team" && added.pair) {
      setAlert({ old: "pair", curr: "team" });
    } else if (newType === "pair" && added.team) {
      setAlert({ old: "team", curr: "pair" });
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setType("");
    setDisable(false);
    reset();
  };

  const handleSelect = (event: SelectChangeEvent) => {
    const newType = event.target.value;
    setType(newType);
    reset();
    checkExclusivity(newType);
  };

  const addPreference = async () => {
    if (type === "team") {
      await updatePreferences(id, type, { team });
    } else if (type === "pair") {
      await updatePreferences(id, type, { pair });
    } else if (type === "exclusions") {
      // Capitalise first and last names
      const names = exclude.split(" ").map((n) => capitalise(n));
      const exclusionsData = await getPreferences(id, "exclusions");
      let exclusions = names.join(" ");
      // Append new exclusion to old string
      if (exclusionsData !== "") {
        exclusions = `${exclusionsData}, ${names.join(" ")}`;
      }
      await updatePreferences(id, type, { exclusions });
    }
    setAdded({ ...added, [type]: true });
    handleClose();
  };

  useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [type]);

  useEffect(() => {
    setAlert({ old: "", curr: "" });
    checkExclusivity(type);
  }, [added]);

  return (
    <div className={experienceStyles.modal}>
      {!open && (
        <Button variant="contained" sx={addExperienceBtn} onClick={handleOpen}>
          Add New Preference
        </Button>
      )}
      {open && (
        <Paper square elevation={3} sx={addModal}>
          <CloseBtn handleClose={handleClose} />
          <FormControl
            sx={{
              margin: "10px 20px 7px",
              fontSize: "12px",
              width: "calc(100% - 40px)",
            }}
          >
            <InputLabel
              id="new-preference-label"
              sx={{ lineHeight: "15px", fontSize: "14px" }}
            >
              New Preference
            </InputLabel>
            <Select
              id="select-type"
              value={type}
              label="New Preference"
              sx={{ height: "45px", fontSize: "14px" }}
              onChange={handleSelect}
            >
              {!added.team && (
                <MenuItem sx={{ fontSize: "14px" }} value="team">
                  Team Preference: &nbsp;already have two teammates
                </MenuItem>
              )}
              {!added.pair && (
                <MenuItem sx={{ fontSize: "14px" }} value="pair">
                  Pair Preference: &nbsp;have one other teammate
                </MenuItem>
              )}
              <MenuItem sx={{ fontSize: "14px" }} value="exclusions">
                Exclusion Preference: &nbsp;don&apos;t want someone
              </MenuItem>
            </Select>
          </FormControl>
          <TeamPairAlert {...alert} />
          <hr className={pageStyles.divider} />
          {type === "team" && (
            <TeamInput
              setDisable={setDisable}
              alert={alert.curr !== ""}
              setPref={setTeam}
            />
          )}
          {type === "pair" && (
            <PairInput
              setDisable={setDisable}
              alert={alert.curr !== ""}
              setPref={setPair}
            />
          )}
          {type === "exclusions" && (
            <ExclusionInput setDisable={setDisable} setPref={setExclude} />
          )}
          {type && (
            <Button
              variant="contained"
              sx={addBtn}
              onClick={addPreference}
              ref={buttonRef}
              disabled={disable}
            >
              Add
            </Button>
          )}
        </Paper>
      )}
    </div>
  );
};

export default PreferenceModal;
