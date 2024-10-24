import { proficiencyLabel } from "@/styles/sxStyles";
import { Box, LinearProgress, Stack, Typography } from "@mui/material"

interface ProficiencyProps {
  language: string;
  proficiency: string;
};

export const textToValue: Record<string, number> = {
  none: 0,
  some: 50,
  prof: 100,
}

const LanguageProficiency: React.FC<ProficiencyProps> = ({ language, proficiency }) => {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 4fr', alignItems: 'center', m: '20px 40px' }}>
      <Typography sx={{ gridColumn: 1, fontSize: '15px'  }}>{language}</Typography>
      <Stack spacing={2} direction="row" sx={{ gridColumn: 2, alignItems: 'center' }}>
        <Typography sx={proficiencyLabel}>None</Typography>
        <LinearProgress variant="determinate" value={textToValue[proficiency]}
          sx={{
            width: '80%',
            backgroundColor: '#c8cce5',
            '& .MuiLinearProgress-bar': {
                backgroundColor: '#969fdd',
            },
          }}
        />
        <Typography sx={proficiencyLabel}>Proficient</Typography>
      </Stack>
    </Box>
  );
}

export default LanguageProficiency;