import profileStyles from "@/styles/Profile.module.css";
import pageStyles from "@/styles/Page.module.css";
import { SelectLanguage } from "./SelectLanguage";
import { EditInput } from "./EditInput";
import { EditInfo } from "@/utils/profileInfo";
import { Dispatch, SetStateAction } from "react";
import { TshirtSize } from "./TshirtSize";
import { MenuItem, Select, SelectChangeEvent } from "@mui/material";

interface EditProps {
  editInfo: EditInfo;
  setEditInfo: Dispatch<SetStateAction<EditInfo>>;
}

export const Edit: React.FC<EditProps> = ({ editInfo, setEditInfo }) => {
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    setEditInfo({ ...editInfo, photoConsent: e.target.value === "yes" });
  };

  const handleInfoChange = (newValue: string | number, field: string) => {
    setEditInfo({ ...editInfo, [field]: newValue });
  };

  const handleLanguageChange = (languages: string[]) => {
    setEditInfo({ ...editInfo, languagesSpoken: languages });
  };

  const handleTshirtChange = (e: SelectChangeEvent<string>) => {
    const size =
      e.target.value === "Select T-Shirt Size" ? null : e.target.value;
    setEditInfo({ ...editInfo, tshirtSize: size });
  };
  return (
    <>
      <EditInput
        name="Pronouns"
        value={editInfo.pronouns}
        onChange={handleInfoChange}
      />
      <SelectLanguage
        languages={editInfo.languagesSpoken}
        setLanguages={handleLanguageChange}
      />
      <EditInput
        name="Dietary Requirements"
        value={editInfo.dietaryRequirements}
        onChange={handleInfoChange}
      />
      <div className={profileStyles["edit-content"]}>
        <p className={pageStyles.bold}>
          Do you consent to appear in photos taken at the contest?
        </p>
        <Select
          id="consent"
          placeholder="Yes or No"
          sx={{ height: "34px", width: "262px", fontSize: "13.3px" }}
          value={editInfo.photoConsent ? "yes" : "no"}
          onChange={handleSelectChange}
        >
          <MenuItem value="yes" sx={{ fontSize: "13.3px" }}>
            Yes
          </MenuItem>
          <MenuItem value="no" sx={{ fontSize: "13.3px" }}>
            No
          </MenuItem>
        </Select>
      </div>
      <hr className={pageStyles.divider} />
      <TshirtSize
        tshirtSize={editInfo.tshirtSize}
        setTshirtSize={handleTshirtChange}
      />
    </>
  );
};