"use client";

import { useEffect, useState } from "react";
import profileStyles from "@/styles/Profile.module.css";
import experienceStyles from "@/styles/Experience.module.css";
import { ProfileProps } from "../page";
import { Box } from "@mui/material";
import PreferenceDialog from "@/components/preferences/PreferenceDialog";
import ExclusionPreference from "@/components/preferences/ExclusionPreference";
import InclusionPreference from "@/components/preferences/InclusionPreference";
import { getPreferences, updatePreferences } from "@/utils/preferenceInfo";
import { useAuth } from "@/components/context-provider/AuthProvider";
import { checkViewingPermissions } from "@/utils/profileInfo";
import { useRouter } from "next/navigation";
import Notif from "@/components/utils/Notif";

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

/**
 * Preferences Page
 * - buttons and dialog to add / edit / remove preferences
 */
const Preferences: React.FC<ProfileProps> = ({ params }) => {
  const [added, setAdded] = useState<PreferenceType>({
    team: false,
    pair: false,
    exclusions: false,
  });
  const { userSession } = useAuth();
  const router = useRouter();
  const [notif, setNotif] = useState({ type: "", message: "" });

  const setDefault = async () => {
    const preference = await getPreferences(params.id, "preferences");
    if (preference) {
      if (preference.length === 1 && preference[0].studentId !== "none") {
        setAdded({ ...added, pair: true });
      } else if (preference.length === 2) {
        setAdded({ ...added, team: true });
      } else if (preference.length === 0) {
        await updatePreferences(params.id, "preferences", "none");
      }
    }
  };

  const setMsg = (msg: string) => {
    setNotif({
      type: msg.includes("Deleted") || msg.includes("Not") ? "delete" : "add",
      message: msg,
    });
  };

  useEffect(() => {
    if (checkViewingPermissions(params.id, userSession)) {
      if (userSession.id === params.id) setDefault();
    } else if (userSession.id !== "") {
      // Redirect user to 404 page not found if they don't have permission to view route
      router.replace("/404");
    }
  }, [userSession]);

  return (
    <div className={profileStyles["inner-screen"]}>
      <div className={profileStyles.title}>
        <h3>Preferences</h3>
      </div>
      <hr className={experienceStyles.divider} />
      <Box sx={{ height: "calc(100% - 121px)", overflow: "scroll" }}>
        <InclusionPreference
          id={params.id}
          added={added}
          setAdded={setAdded}
          setMsg={setMsg}
        />
        <ExclusionPreference
          id={params.id}
          changed={added.exclusions}
          complete={() => setAdded({ ...added, exclusions: false })}
          setMsg={setMsg}
        />
        {userSession.id === params.id && (
          <PreferenceDialog
            id={params.id}
            added={added}
            setAdded={setAdded}
            setMsg={setMsg}
          />
        )}
      </Box>
      {notif.type !== "" && <Notif notif={notif} setNotif={setNotif} />}
    </div>
  );
};

export default Preferences;
