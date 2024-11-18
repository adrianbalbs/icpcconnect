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
import { PreferenceType } from "@/profile/[id]/preferences/page";
import TeamInput from "./dialogInput/TeamInput";
import PairInput from "./dialogInput/PairInput";
import ExclusionInput from "./dialogInput/ExclusionInput";
import TeamPairAlert from "./dialogInput/TeamPairAlert";
import { getPreferences, updatePreferences } from "@/utils/preferenceInfo";

interface DialogProps {
  id: string;
  added: PreferenceType;
  setAdded: Dispatch<SetStateAction<PreferenceType>>;
  setMsg: (msg: string) => void;
}

/**
 * Add Preference dialog component
 * - renders select dropdown to choose preference type
 * - includes:
 *    - pair, team, exclusion
 */
const PreferenceDialog: React.FC<DialogProps> = ({
  id,
  added,
  setAdded,
  setMsg,
}) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [disable, setDisable] = useState(true);
  const [alert, setAlert] = useState({ old: "", curr: "" });
  const [include, setInclude] = useState("");
  const [exclude, setExclude] = useState("");

  const reset = () => {
    setAlert({ old: "", curr: "" });
    setInclude("");
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
    let success: boolean | undefined = false;
    if (type === "team" || type === "pair") {
      success = await updatePreferences(id, "preferences", include);
      if (success) setMsg(`New ${capitalise(type)} Preference Added!`);
    } else if (type === "exclusions") {
      // Capitalise first and last names
      const names = exclude.split(" ").map((n) => capitalise(n));
      const exclusionsData = await getPreferences(id, type);
      let exclusions = names.join(" ");
      // Append new exclusion to old string
      if (exclusionsData !== "") {
        exclusions = `${exclusionsData}, ${names.join(" ")}`;
      }
      // Sort exclusions alphabetically
      const sorted = exclusions.split(", ").sort().join(", ");
      success = await updatePreferences(id, type, sorted);
      if (success) setMsg("New Exclusion Preference Added!");
    }
    if (success) {
      setAdded({ ...added, [type]: true });
    } else {
      setMsg("New Preference Was Not Added Successfully!");
    }
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
              setPref={setInclude}
            />
          )}
          {type === "pair" && (
            <PairInput
              setDisable={setDisable}
              alert={alert.curr !== ""}
              setPref={setInclude}
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

export default PreferenceDialog;
