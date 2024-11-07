import pageStyles from "@/styles/Page.module.css";
import experienceStyles from "@/styles/Experience.module.css";
import { experienceHeading } from "@/styles/sxStyles";
import { Box, IconButton, Typography } from "@mui/material";
import { Teammate } from "@/profile/[id]/preferences/page";
import DeleteIcon from "@mui/icons-material/Delete";

interface TeamProps {
  teammates: Teammate[];
  deletePreference: (type: string) => void;
}

const TeamPreference = ({ teammates, deletePreference }: TeamProps) => {
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
          onClick={() => deletePreference("team")}
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
        <Typography sx={{ fontSize: "14px" }}>
          {teammates[0].studentId}
        </Typography>
        <Typography sx={{ fontSize: "14px" }}>
          {teammates[0].name ?? "(Not registered yet)"}
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
        <Typography sx={{ fontSize: "14px" }}>
          {teammates[1].studentId}
        </Typography>
        <Typography sx={{ fontSize: "14px" }}>
          {teammates[1].name ?? "(Not registered yet)"}
        </Typography>
      </Box>
      <hr className={experienceStyles.divider} />
    </>
  );
};

export default TeamPreference;
