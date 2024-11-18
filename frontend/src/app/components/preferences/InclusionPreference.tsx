import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { capitalise } from "@/utils/profileInfo";
import { getPreferences } from "@/utils/preferenceInfo";
import pageStyles from "@/styles/Page.module.css";
import experienceStyles from "@/styles/Experience.module.css";
import { experienceHeading } from "@/styles/sxStyles";
import { Box, Typography } from "@mui/material";
import { PreferenceType, Teammate } from "@/profile/[id]/preferences/page";
import { updatePreferences } from "@/utils/preferenceInfo";
import DeleteBtn from "../utils/DeleteBtn";

interface InclusionProps {
  id: string;
  added: PreferenceType;
  setAdded: Dispatch<SetStateAction<PreferenceType>>;
  setMsg: (msg: string) => void;
}

/**
 * Render Pair / Team component
 * - renders pair / team preference on page
 * - includes: teammate(s) name and student id
 * - note: when a teammate preferenced is not yet registered,
 *         their name renders as "(Not registered yet)"
 */
const InclusionPreference = ({
  id,
  added,
  setAdded,
  setMsg,
}: InclusionProps) => {
  const [type, setType] = useState("");
  const [inclusion, setInclusion] = useState<Teammate[]>([]);

  const getStudents = async () => {
    const preference = await getPreferences(id, "preferences");
    if (
      preference &&
      preference.length > 0 &&
      preference[0].studentId !== "none"
    ) {
      setInclusion(preference);
      setType(preference.length > 1 ? "team" : "pair");
    }
  };

  const deletePreference = async () => {
    await updatePreferences(id, "preferences", "none");
    setType("");
    setInclusion([]);
    setAdded({ ...added, [type]: false });
    setMsg(`${capitalise(type)} Preference Deleted!`);
  };

  useEffect(() => {
    getStudents();
  }, [added]);

  if (type !== "") {
    return (
      <>
        <h3 className={experienceStyles.heading}>
          {capitalise(type)} Preference
        </h3>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "7fr 12fr 1fr",
            alignItems: "center",
            m: "10px 32px 13px 40px",
          }}
        >
          <Typography sx={experienceHeading}>Student Id</Typography>
          <Typography sx={experienceHeading}>Student Name</Typography>
          <DeleteBtn id={id} handleDelete={deletePreference} />
        </Box>
        <hr className={pageStyles.divider} />
        {inclusion.map((i) => (
          <Box
            key={i.studentId}
            sx={{
              display: "grid",
              gridTemplateColumns: "7fr 12fr 1fr",
              alignItems: "center",
              m: "20px 40px",
            }}
          >
            <Typography sx={{ fontSize: "14px" }}>{i.studentId}</Typography>
            <Typography sx={{ fontSize: "14px" }}>
              {i.name === "" ? "(Not registered yet)" : i.name}
            </Typography>
          </Box>
        ))}
        <hr className={experienceStyles.divider} />
      </>
    );
  }
};

export default InclusionPreference;
