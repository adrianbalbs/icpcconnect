"use client";

import { useEffect, useState } from "react";
import profileStyles from "@/styles/Profile.module.css";
import experienceStyles from "@/styles/Experience.module.css";
import { ProfileProps } from "../page";
import { Box } from "@mui/material";
import PreferenceModal from "@/components/preferences/PreferenceModal";
import ExclusionPreference from "@/components/preferences/ExclusionPreference";
import InclusionPreference from "@/components/preferences/InclusionPreference";
import { getPreferences, updatePreferences } from "@/utils/preferenceInfo";
import { useAuth } from "@/components/AuthProvider/AuthProvider";
import { checkViewingPermissions } from "@/utils/profileInfo";
import { useRouter } from "next/navigation";

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
  const { userSession } = useAuth();
  const router = useRouter();

  const setDefault = async () => {
    const preference = await getPreferences(params.id, "preferences");
    if (preference) {
      if (preference.length === 1) {
        setAdded({ ...added, pair: true });
      } else if (preference.length === 2) {
        setAdded({ ...added, team: true });
      } else {
        await updatePreferences(params.id, "preferences", "none");
      }
    }
  };

  useEffect(() => {
    if (checkViewingPermissions(params.id, userSession)) {
      if (userSession.id === params.id) setDefault();
    } else {
      // Redirect user to 404 page not found if they don't have permission to view route
      router.replace("/404");
    }
  }, []);

  return (
    <div className={profileStyles["inner-screen"]}>
      <div className={profileStyles.title}>
        <h3>Preferences</h3>
      </div>
      <hr className={experienceStyles.divider} />
      <Box sx={{ height: "calc(100% - 121px)", overflow: "scroll" }}>
        <InclusionPreference id={params.id} added={added} setAdded={setAdded} />
        <ExclusionPreference
          id={params.id}
          changed={added.exclusions}
          complete={() => setAdded({ ...added, exclusions: false })}
        />
        {userSession.id === params.id && (
          <PreferenceModal id={params.id} added={added} setAdded={setAdded} />
        )}
      </Box>
    </div>
  );
};

export default Preferences;
