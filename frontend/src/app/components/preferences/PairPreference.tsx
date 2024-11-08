import pageStyles from "@/styles/Page.module.css";
import experienceStyles from "@/styles/Experience.module.css";
import { experienceHeading } from "@/styles/sxStyles";
import { Box, IconButton, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
// import { getPreferences } from "@/utils/preferenceInfo";
import { useEffect, useState } from "react";

interface PairProps {
  id: string;
  added: boolean;
  deletePref: (type: string) => void;
}

const PairPreference = ({ id, added, deletePref }: PairProps) => {
  const [pair, setPair] = useState({ studentId: "", name: null });

  const getPair = async () => {
    // const pairData = await getPreferences(id, "pair");
    // if (pairData) setPair(pairData);
    console.log(id);
  };

  const deletePair = async () => {
    setPair({ studentId: "", name: null });
    deletePref("pair");
  };

  useEffect(() => {
    getPair();
  }, [added]);

  if (pair.studentId !== "") {
    return (
      <>
        <h3 className={experienceStyles.heading}>Pair Preference</h3>
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
            onClick={deletePair}
          >
            <DeleteIcon sx={{ fontSize: "21px" }} />
          </IconButton>
        </Box>
        <hr className={pageStyles.divider} />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "7fr 12fr 1fr",
            alignItems: "center",
            m: "20px 40px",
          }}
        >
          <Typography sx={{ fontSize: "14px" }}>{pair.studentId}</Typography>
          <Typography sx={{ fontSize: "14px" }}>
            {pair.name ?? "(Not registered yet)"}
          </Typography>
        </Box>
        <hr className={experienceStyles.divider} />
      </>
    );
  }
};

export default PairPreference;
