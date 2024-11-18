import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { Dispatch, SetStateAction } from "react";

interface EditProps {
  original: string[];
  selected: string[];
  setSelected: Dispatch<SetStateAction<string[]>>;
}

/**
 * Edit Exclusion component
 * - renders checkboxes to edit exclusions
 */
const EditExclusion = ({ original, selected, setSelected }: EditProps) => {
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    value: string,
  ) => {
    if (event.target.checked && !selected.includes(value)) {
      setSelected([...selected, value].sort());
    } else {
      setSelected(selected.filter((s) => s !== value));
    }
  };

  return (
    <FormGroup>
      {original.map((s) => (
        <FormControlLabel
          key={s}
          label={s}
          control={
            <Checkbox
              checked={selected.includes(s)}
              onChange={(e) => handleChange(e, s)}
              sx={{
                transform: "scale(0.8)",
                color: "#7D84AF",
                "&.Mui-checked": {
                  color: "#7D84AF",
                },
              }}
            />
          }
          sx={{ "& .MuiFormControlLabel-label": { fontSize: "14px" } }}
        />
      ))}
    </FormGroup>
  );
};

export default EditExclusion;
