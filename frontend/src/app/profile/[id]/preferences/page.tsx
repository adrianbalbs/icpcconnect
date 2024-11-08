"use client";

import { useState } from "react";
import profileStyles from "@/styles/Profile.module.css";
import experienceStyles from "@/styles/Experience.module.css";
import { ProfileProps } from "../page";
import { Box } from "@mui/material";
import PreferenceModal from "@/components/preferences/PreferenceModal";
import PairPreference from "@/components/preferences/PairPreference";
import TeamPreference from "@/components/preferences/TeamPreference";
import ExclusionPreference from "@/components/preferences/ExclusionPreference";

export interface PreferenceType {
  team: boolean;
  pair: boolean;
  exclusions: boolean;
}

export interface Teammate {
  studentId: string;
  name: string | null;
}

export interface PreferenceInput {
  team: Teammate[];
  pair: Teammate;
  exclusions: string[];
}

const Preferences: React.FC<ProfileProps> = ({ params }) => {
  const [added, setAdded] = useState<PreferenceType>({
    team: false,
    pair: false,
    exclusions: false,
  });

  const setAddedFalse = (type: string) => {
    setAdded({ ...added, [type]: false });
  };

  return (
    <div className={profileStyles["inner-screen"]}>
      <div className={profileStyles.title}>
        <h3>Preferences</h3>
      </div>
      <hr className={experienceStyles.divider} />
      <Box sx={{ height: "calc(100% - 121px)", overflow: "scroll" }}>
        <TeamPreference
          id={params.id}
          added={added.pair}
          deletePref={setAddedFalse}
        />
        <PairPreference
          id={params.id}
          added={added.pair}
          deletePref={setAddedFalse}
        />
        <ExclusionPreference
          id={params.id}
          changed={added.exclusions}
          complete={setAddedFalse}
        />
        <PreferenceModal id={params.id} added={added} setAdded={setAdded} />
      </Box>
    </div>
  );
};

export default Preferences;
