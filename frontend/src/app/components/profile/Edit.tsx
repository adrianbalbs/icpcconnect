"use client";
import profileStyles from "@/styles/Profile.module.css";
import pageStyles from "@/styles/Page.module.css";
import SelectLanguage from "./SelectLanguage";
import { EditInput } from "./EditInput";
import { EditInfo, getInfo } from "@/utils/profileInfo";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface EditProps {
  id: string;
  editInfo: EditInfo;
  setEditInfo: Dispatch<SetStateAction<EditInfo>>;
}

export const Edit: React.FC<EditProps> = ({ id, editInfo, setEditInfo }) => {
  const storeInfo = async () => {
    const data = await getInfo(id);
    if (data !== undefined) {
      setEditInfo(data.editInfo);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditInfo({ ...editInfo, photoConsent: e.target.value === "yes" });
  };

  const handleInfoChange = (newValue: string | number, field: string) => {
    setEditInfo({ ...editInfo, [field]: newValue });
  };

  useEffect(() => {
    storeInfo();
  }, [id]);
  return (
    <>
      <EditInput
        name="Pronouns"
        value={editInfo.pronouns}
        onChange={handleInfoChange}
      />
      <SelectLanguage />
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
      <EditInput
        name="T-Shirt Size"
        value={editInfo.tshirtSize ? editInfo.tshirtSize : ""}
        onChange={handleInfoChange}
      />
    </>
  );
};
