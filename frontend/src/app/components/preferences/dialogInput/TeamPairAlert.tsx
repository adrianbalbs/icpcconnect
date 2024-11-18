import { Box, Collapse, Typography } from "@mui/material";

interface AlertProps {
  old: string;
  curr: string;
}

/**
 * Team / Pair exclusive component
 * - renders warning to alert user they cannot add both a team and pair
 *   preference at the same time
 */
const TeamPairAlert = ({ old, curr }: AlertProps) => {
  return (
    <Box sx={{ m: "0 20px 28px", width: "calc(100% - 40px)" }}>
      <Collapse in={curr !== ""}>
        <Typography
          sx={{
            textAlign: "center",
            fontSize: "12px",
            color: "#555555",
            bgcolor: "#fce5ae",
            borderRadius: "5px",
          }}
        >
          <b>
            Warning: You cannot have both a pair and a team preference at the
            same time!
          </b>
          <br />
          <i>
            Please delete {old} preference if you wish to add {curr} preference.
          </i>
        </Typography>
      </Collapse>
    </Box>
  );
};

export default TeamPairAlert;
