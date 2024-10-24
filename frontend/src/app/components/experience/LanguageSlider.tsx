import { Dispatch, SetStateAction } from 'react';
import styles from '@/styles/Experience.module.css';
import { Slider, Stack } from "@mui/material";
import { Experiences } from '@/profile/[id]/experience/page';
import { capitalise } from '@/utils/profileInfo';

interface SliderProps {
  type: string;
  experience: Experiences;
  setExperience: Dispatch<SetStateAction<Experiences>>;
}

const marks = [
  {
    value: 0,
    label: 'None',
  },
  {
    value: 50,
    label: 'Some',
  },
  {
    value: 100,
    label: 'Proficient',
  },
];

const valueToText: Record<number, string> = {
  0: 'none',
  50: 'some',
  100: 'prof'
}

const LanguageSlider: React.FC<SliderProps> = ({ type, experience, setExperience }) => {

  const onChange = (event: Event, value: number | number[]) => {
    const key = `${type}Experience`;
    const assertValue = Number(value);
    setExperience({ ...experience, [key]: valueToText[assertValue] });
  }

  return (
    <Stack spacing={10} direction="row" sx={{ alignItems: 'center', justifyContent: 'flex-end', mb: 5 }}>
      <p className={styles.language}>{type === 'cpp' ? 'C++' : capitalise(type)} Experience</p>
      <Slider
        aria-label={`${type}Experience`}
        defaultValue={0}
        size="small"
        step={null}
        valueLabelDisplay="off"
        marks={marks}
        sx={{ width: 'calc(100% - 220px)', color: '#8094AB' }}
        onChange={onChange}
      />
    </Stack>
  );
}

export default LanguageSlider;