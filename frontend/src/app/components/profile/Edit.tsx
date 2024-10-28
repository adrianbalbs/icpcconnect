import profileStyles from "@/styles/Profile.module.css";
import pageStyles from "@/styles/Page.module.css";
import { SelectLanguage } from "./SelectLanguage";
import { EditInput } from "./EditInput";
import { EditInfo } from "@/utils/profileInfo";
import { Dispatch, SetStateAction } from "react";
import { TshirtSize } from "./TshirtSize";

interface EditProps {
  editInfo: EditInfo;
  setEditInfo: Dispatch<SetStateAction<EditInfo>>;
}

export const Edit: React.FC<EditProps> = ({ editInfo, setEditInfo }) => {
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditInfo({ ...editInfo, photoConsent: e.target.value === "yes" });
  };

  const handleInfoChange = (newValue: string | number, field: string) => {
    setEditInfo({ ...editInfo, [field]: newValue });
  };

  const handleLanguageChange = (languages: string[]) => {
    setEditInfo({ ...editInfo, languagesSpoken: languages });
  };

  const handleTshirtChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
      <div className={profileStyles.content}>
        <p className={pageStyles.bold}>
          Do you consent to appear in photos taken at the contest?
        </p>
        <select
          id="consent"
          value={editInfo.photoConsent ? "yes" : "no"}
          onChange={handleSelectChange}
          className={profileStyles["select-box"]}
        >
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
      <hr className={pageStyles.divider} />
      ,
      <TshirtSize
        tshirtSize={editInfo.tshirtSize}
        setTshirtSize={handleTshirtChange}
      />
    </>
  );
};
