import profileStyles from "@/styles/Profile.module.css";
import pageStyles from "@/styles/Page.module.css";
import { MenuItem, Select, SelectChangeEvent } from "@mui/material";

const sizes = [
  "Select T-Shirt Size",
  "Mens XS",
  "Mens S",
  "Mens M",
  "Mens L",
  "Mens XL",
  "Mens 2XL",
  "Mens 3XL",
  "Mens 4XL",
  "Ladies S",
  "Ladies M",
  "Ladies L",
  "Ladies XL",
  "Ladies 2XL",
  "Ladies 3XL",
];

interface TshirtProps {
  tshirtSize: string | null;
  setTshirtSize: (e: SelectChangeEvent<string>) => void;
}

/**
 * T-shirt Selection component
 * - renders selection box for t-shirt sizes
 */
export const TshirtSize = ({ tshirtSize, setTshirtSize }: TshirtProps) => {
  return (
    <>
      <div className={profileStyles["edit-content"]}>
        <p className={pageStyles.bold}>T-Shirt Size</p>
        <Select
          id="consent"
          placeholder="Yes or No"
          sx={{ height: "34px", width: "262px", fontSize: "13.3px" }}
          value={tshirtSize ?? "Select T-Shirt Size"}
          onChange={setTshirtSize}
        >
          {sizes.map((s) => (
            <MenuItem key={s} value={s} sx={{ fontSize: "13.3px" }}>
              {s}
            </MenuItem>
          ))}
        </Select>
      </div>
      <hr className={pageStyles.divider} />
    </>
  );
};
