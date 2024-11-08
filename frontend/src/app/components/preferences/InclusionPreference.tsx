import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { capitalise } from "@/utils/profileInfo";
// import { getPreferences } from "@/utils/preferenceInfo";
import pageStyles from "@/styles/Page.module.css";
import experienceStyles from "@/styles/Experience.module.css";
import { experienceHeading } from "@/styles/sxStyles";
import { Box, IconButton, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { PreferenceType, Teammate } from "@/profile/[id]/preferences/page";
import { updatePreferences } from "@/utils/preferenceInfo";

interface InclusionProps {
  id: string;
  added: PreferenceType;
  setAdded: Dispatch<SetStateAction<PreferenceType>>;
}

const InclusionPreference = ({ id, added, setAdded }: InclusionProps) => {
  const [type, setType] = useState("");
  const [inclusion, setInclusion] = useState<Teammate[]>([]);

  const getStudents = async () => {
    // const preference = await getPreferences(id, "preferences");
    // if (preference && preference.length > 0) {
    //   setInclusion(preference);
    //   setType(preference.length > 1 ? "team" : "pair");
    // }
    console.log(id);
  };

  const deletePreference = async () => {
    setType("");
    setInclusion([]);
    setAdded({ ...added, [type]: false });
    updatePreferences(id, "preferences", "");
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
          <IconButton
            sx={{
              height: "21px",
              width: "25px",
              borderRadius: "5px",
              justifySelf: "end",
            }}
            onClick={deletePreference}
          >
            <DeleteIcon sx={{ fontSize: "21px" }} />
          </IconButton>
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
