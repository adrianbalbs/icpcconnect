import { Dispatch, SetStateAction } from "react";
import styles from "@/styles/Experience.module.css";
import { Slider, Stack } from "@mui/material";
import { Experiences } from "@/profile/[id]/experience/page";
import { capitalise } from "@/utils/profileInfo";

interface SliderProps {
  type: string;
  experience: Experiences;
  setExperience: Dispatch<SetStateAction<Experiences>>;
}

const marks = [
  {
    value: 0,
    label: "None",
  },
  {
    value: 50,
    label: "Some",
  },
  {
    value: 100,
    label: "Proficient",
  },
];

/**
 * Add Language Experience component
 * - renders a slider selection for relevant language experience
 */
const LanguageSlider: React.FC<SliderProps> = ({
  type,
  experience,
  setExperience,
}) => {
  const key = `${type}Experience` as keyof Experiences;

  const getValue = () => {
    const entry = marks.find(
      (m) => m.label.toLowerCase().slice(0, 4) === experience[key],
    );
    return entry?.value;
  };

  const onChange = (event: Event, value: number | number[]) => {
    const entry = marks.find((m) => m.value === Number(value));
    const label = entry ? entry.label.toLowerCase() : "none";
    setExperience({ ...experience, [key]: label.slice(0, 4) });
  };

  return (
    <Stack
      spacing={10}
      direction="row"
      sx={{ alignItems: "center", justifyContent: "flex-end", mb: 5 }}
    >
      <p className={styles.language}>
        {type === "cpp" ? "C++" : capitalise(type)} Experience
      </p>
      <Slider
        aria-label={`${type}Experience`}
        defaultValue={getValue()}
        size="small"
        step={null}
        valueLabelDisplay="off"
        marks={marks}
        sx={{ width: "calc(100% - 220px)", color: "#8094AB" }}
        onChange={onChange}
      />
    </Stack>
  );
};

export default LanguageSlider;
