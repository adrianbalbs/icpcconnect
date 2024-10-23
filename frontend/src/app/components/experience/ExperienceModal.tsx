import { Dispatch, SetStateAction, useState } from 'react';
import { addBtn, addExperienceBtn, addModal } from '@/styles/Overriding';
import pageStyles from '@/styles/Page.module.css';
import profileStyles from '@/styles/Profile.module.css';
import { Box, Button, FormControl, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, TextField } from '@mui/material';
import CloseBtn from '../utils/CloseBtn';
import LanguageSlider from './LanguageSlider';
import { Experiences, ExperienceType } from '@/profile/[id]/experience/page';
import NumberInput from './NumberInput';
import CourseCheckbox from './CourseCheckbox';

interface ModalProps {
  added: ExperienceType;
  setAdded: Dispatch<SetStateAction<ExperienceType>>;
  experience: Experiences;
  setExperience: Dispatch<SetStateAction<Experiences>>;
}

const ExperienceModal: React.FC<ModalProps> = ({ added, setAdded, experience, setExperience }) => {
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
    setNewExperience(experience);
  }

  const handleSelect = (event: SelectChangeEvent) => {
    setType(event.target.value);
  };

  const addExperience = () => {
    const newAdded = { ...added, [type]: true }
    setAdded(newAdded);
    setExperience(newExperience);
    handleClose();
  }

  return (
    <div className={profileStyles.modal}>
      <Button variant="contained" sx={addExperienceBtn} onClick={handleOpen}>Add New Skill/Experience</Button>
      {open && <Paper square elevation={3} sx={addModal}>
        <CloseBtn handleClose={handleClose}/>
        <FormControl sx={{ margin: '10px 20px 25px', fontSize: '12px', width: 'calc(100% - 40px)' }} >
          <InputLabel id="new-experience-label" sx={{ lineHeight: '15px', fontSize: '14px' }}>New Skill / Experience</InputLabel>
            <Select
              id="select-type"
              value={type}
              label="New Skill / Experience"
              sx={{ height: '45px', fontSize: '14px' }}
              onChange={handleSelect}
            >
              {!added.language && <MenuItem sx={{ fontSize: '14px' }} value="language">Language Proficiency</MenuItem>}
              {!added.coursesTaken && <MenuItem sx={{ fontSize: '14px' }} value="coursesTaken">Relevant Courses</MenuItem>}
              {!added.contestExperience && <MenuItem sx={{ fontSize: '14px' }} value="contestExperience">Past Contests</MenuItem>}
              {!added.leetcodeRating && <MenuItem sx={{ fontSize: '14px' }} value="leetcodeRating">LeetCode Contest Rating</MenuItem>}
              {!added.codeforcesRating && <MenuItem sx={{ fontSize: '14px' }} value="codeforcesRating">Codeforces Contest Rating</MenuItem>}
            </Select>
          </FormControl>
          <hr className={pageStyles.divider}/>
          {type === 'language' && <Box sx={{ margin: '25px 45px 55px 30px', width: 'calc(100% - 75px)' }}>
            <LanguageSlider type="python" experience={newExperience} setExperience={setNewExperience}/>
            <LanguageSlider type="java" experience={newExperience} setExperience={setNewExperience}/>
            <LanguageSlider type="cpp"  experience={newExperience} setExperience={setNewExperience}/>
            <LanguageSlider type="c" experience={newExperience} setExperience={setNewExperience}/>
          </Box>}
          {type === 'coursesTaken' && <CourseCheckbox setDisable={setDisable} />}
          {type === 'contestExperience' && <NumberInput type={0} setDisable={setDisable} />}
          {type === 'leetcodeRating' && <NumberInput type={1} setDisable={setDisable} />}
          {type === 'codeforcesRating' && <NumberInput type={2} setDisable={setDisable} />}
          {type && <Button variant="contained" sx={addBtn} onClick={addExperience} disabled={disable}>Add</Button>}
      </Paper>}
    </div>
  );
}

export default ExperienceModal;
