import axios from 'axios';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { SERVER_URL } from '@/utils/constants';
import { addBtn, addExperienceBtn, addModal } from '@/styles/sxStyles';
import pageStyles from '@/styles/Page.module.css';
import experienceStyles from '@/styles/Experience.module.css';
import { Box, Button, FormControl, InputLabel, MenuItem, Paper, Select, SelectChangeEvent } from '@mui/material';
import CloseBtn from '../utils/CloseBtn';
import LanguageSlider from './LanguageSlider';
import { Experiences, ExperienceType } from '@/profile/[id]/experience/page';
import NumberInput from './NumberInput';
import CourseCheckbox from './CourseCheckbox';

interface ModalProps {
  id: string;
  added: ExperienceType;
  setAdded: Dispatch<SetStateAction<ExperienceType>>;
  experience: Experiences;
}

const ExperienceModal: React.FC<ModalProps> = ({ id, added, setAdded, experience }) => {
  const hrRef = useRef<HTMLHRElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('');
  const [disable, setDisable] = useState(false);
  const [newExperience, setNewExperience] = useState<Experiences>(experience);

  const handleOpen = () => {
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
    setType('');
    setDisable(false);
    setNewExperience(experience);
  }

  const handleSelect = (event: SelectChangeEvent) => {
    if (event.target.value === 'language') setDisable(false);
    setNewExperience(experience);
    setType(event.target.value);
  };

  // const handleChange = (changed: string, value: string | number | number[]) => {
  //   setNewExperience({ ...newExperience, [changed]: value });
  // }

  const addExperience = async () => {
    try {
      await axios.put(`${SERVER_URL}/api/contest-registration/${id}`, newExperience);
      setAdded({ ...added, [type]: true });
    } catch (error) {
      console.log(`Update experience error: ${error}`);
    }
    handleClose();
  }

  useEffect(() => {
    if (hrRef.current) {
      hrRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [open]);

  useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}, [type]);

  return (
    <div className={experienceStyles.modal}>
      {!open && <Button variant="contained" sx={addExperienceBtn} onClick={handleOpen}>Add {Object.values(added).includes(true) ? 'or Edit' : 'New'} Skill/Experience</Button>}
      {open && <Paper square elevation={3} sx={addModal}>
        <CloseBtn handleClose={handleClose}/>
        <FormControl sx={{ margin: '10px 20px 25px', fontSize: '12px', width: 'calc(100% - 40px)' }} >
          <InputLabel id="new-experience-label" sx={{ lineHeight: '15px', fontSize: '14px' }}>Select Skill / Experience</InputLabel>
            <Select
              id="select-type"
              value={type}
              label="Select Skill / Experience"
              sx={{ height: '45px', fontSize: '14px' }}
              onChange={handleSelect}
            >
              <MenuItem sx={{ fontSize: '14px' }} value="language">Programming Language Experience</MenuItem>
              <MenuItem sx={{ fontSize: '14px' }} value="coursesCompleted">Relevant Courses</MenuItem>
              <MenuItem sx={{ fontSize: '14px' }} value="contestExperience">Past Contests</MenuItem>
              <MenuItem sx={{ fontSize: '14px' }} value="leetcodeRating">LeetCode Contest Rating</MenuItem>
              <MenuItem sx={{ fontSize: '14px' }} value="codeforcesRating">Codeforces Contest Rating</MenuItem>
            </Select>
          </FormControl>
          <hr className={pageStyles.divider} ref={hrRef}/>
          {type === 'language' && <Box sx={{ m: '25px 45px 55px 30px', width: 'calc(100% - 75px)' }}>
            <LanguageSlider type="c" experience={newExperience} setExperience={setNewExperience} />
            <LanguageSlider type="cpp"  experience={newExperience} setExperience={setNewExperience} />
            <LanguageSlider type="java" experience={newExperience} setExperience={setNewExperience} />
            <LanguageSlider type="python" experience={newExperience} setExperience={setNewExperience} />
          </Box>}
          {type === 'coursesCompleted' && <CourseCheckbox setDisable={setDisable} experience={newExperience} setExperience={setNewExperience} />}
          {type === 'contestExperience' && <NumberInput type={0} setDisable={setDisable} experience={newExperience} setExperience={setNewExperience} />}
          {type === 'leetcodeRating' && <NumberInput type={1} setDisable={setDisable} experience={newExperience} setExperience={setNewExperience} />}
          {type === 'codeforcesRating' && <NumberInput type={2} setDisable={setDisable} experience={newExperience} setExperience={setNewExperience} />}
          {type && <Button variant="contained" sx={addBtn} onClick={addExperience} ref={buttonRef} disabled={disable}>{added[type as keyof ExperienceType] ? 'Save Edit' : 'Add'}</Button>}
      </Paper>}
    </div>
  );
}

export default ExperienceModal;
