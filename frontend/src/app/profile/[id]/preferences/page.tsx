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
  const [changed, setChanged] = useState<PreferenceType>({
    team: false,
    pair: false,
    exclusions: false,
  });
  const [preferences, setPreferences] = useState<PreferenceInput>({
    team: [
      { studentId: "", name: null },
      { studentId: "", name: null },
    ],
    pair: { studentId: "", name: null },
    exclusions: [],
  });

  const completeFetch = (type: string) => {
    setChanged({ ...changed, [type]: false });
  };

  const deletePreference = (type: string) => {
    setChanged({ ...changed, [type]: true });
    if (type === "team") {
      setPreferences({
        ...preferences,
        team: [
          { studentId: "", name: null },
          { studentId: "", name: null },
        ],
      });
    } else if (type === "pair") {
      setPreferences({ ...preferences, pair: { studentId: "", name: null } });
    }
  };

  return (
    <div className={profileStyles["inner-screen"]}>
      <div className={profileStyles.title}>
        <h3>Preferences</h3>
      </div>
      <hr className={experienceStyles.divider} />
      <Box sx={{ height: "calc(100% - 121px)", overflow: "scroll" }}>
        {changed.team && (
          <TeamPreference
            teammates={preferences.team}
            deletePreference={deletePreference}
          />
        )}
        {changed.pair && (
          <PairPreference
            {...preferences.pair}
            deletePreference={deletePreference}
          />
        )}
        <ExclusionPreference
          id={params.id}
          changed={changed.exclusions}
          complete={completeFetch}
        />
        <PreferenceModal
          id={params.id}
          added={changed}
          setAdded={setChanged}
          preferences={preferences}
          setPreferences={setPreferences}
        />
      </Box>
    </div>
  );
};

export default Preferences;
