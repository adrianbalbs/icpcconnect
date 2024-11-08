import pageStyles from "@/styles/Page.module.css";
import experienceStyles from "@/styles/Experience.module.css";
import { experienceHeading } from "@/styles/sxStyles";
import { Box, IconButton, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";
// import { getPreferences } from "@/utils/preferenceInfo";

interface TeamProps {
  id: string;
  added: boolean;
  deletePref: (type: string) => void;
}

const TeamPreference = ({ id, added, deletePref }: TeamProps) => {
  const [team, setTeam] = useState([
    { studentId: "", name: null },
    { studentId: "", name: null },
  ]);

  const getTeam = async () => {
    // const teamData = await getPreferences(id, "team");
    // if (teamData) setTeam(teamData);
    console.log(id);
  };

  const deleteTeam = async () => {
    setTeam([
      { studentId: "", name: null },
      { studentId: "", name: null },
    ]);
    deletePref("team");
  };

  useEffect(() => {
    getTeam();
  }, [added]);

  if (team[0].studentId !== "") {
    return (
      <>
        <h3 className={experienceStyles.heading}>Team Preference</h3>
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
            onClick={deleteTeam}
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
          <Typography sx={{ fontSize: "14px" }}>{team[0].studentId}</Typography>
          <Typography sx={{ fontSize: "14px" }}>
            {team[0].name ?? "(Not registered yet)"}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "7fr 12fr 1fr",
            alignItems: "center",
            m: "20px 40px",
          }}
        >
          <Typography sx={{ fontSize: "14px" }}>{team[1].studentId}</Typography>
          <Typography sx={{ fontSize: "14px" }}>
            {team[1].name ?? "(Not registered yet)"}
          </Typography>
        </Box>
        <hr className={experienceStyles.divider} />
      </>
    );
  }
};

export default TeamPreference;
