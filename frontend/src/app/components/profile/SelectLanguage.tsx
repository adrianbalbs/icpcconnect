import { Theme, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import { Checkbox, ListItemText } from "@mui/material";
import { languagesList } from "@/utils/language";
import pageStyles from "@/styles/Page.module.css";
import profileStyles from "@/styles/Profile.module.css";

interface LanguageProps {
  languages: string[];
  setLanguages: (languages: string[]) => void;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name: string, languages: readonly string[], theme: Theme) {
  return {
    fontWeight: languages.includes(name)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}

/**
 * Language Selection component
 * - renders selection box which allows multiple select of languages
 */
export const SelectLanguage = ({ languages, setLanguages }: LanguageProps) => {
  const theme = useTheme();

  const handleChange = (event: SelectChangeEvent<typeof languages>) => {
    const {
      target: { value },
    } = event;
    setLanguages(typeof value === "string" ? value.split(",") : value);
  };

  return (
    <>
      <div className={profileStyles["edit-content"]}>
        <p className={pageStyles.bold}>Languages Spoken</p>
        <FormControl>
          <Select
            multiple
            value={languages}
            onChange={handleChange}
            sx={{ height: "34px", width: "262px" }}
            input={<OutlinedInput id="select-multiple-chip" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            {languagesList.map((l) => (
              <MenuItem
                key={l.code}
                value={l.code}
                style={getStyles(l.name, languages, theme)}
              >
                <Checkbox checked={languages.includes(l.code)} />
                <ListItemText primary={l.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <hr className={pageStyles.divider} />
    </>
  );
};
