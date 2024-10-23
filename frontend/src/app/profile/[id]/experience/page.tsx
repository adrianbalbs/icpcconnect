'use client';

import { useState } from 'react';
import profileStyles from '@/styles/Profile.module.css';
import pageStyles from '@/styles/Page.module.css';
import { addBtn, addModal } from '@/styles/Overriding';
import { Button, FormControl, InputLabel, MenuItem, Paper, Select, SelectChangeEvent } from '@mui/material';
import CloseBtn from '@/components/utils/CloseBtn';
// import { ProfileProps } from '../page';

// TODO: Fix types
export interface Experiences {
  cExperience: string,
  codeforcesRating: number,
  contestExperience: number,
  coursesTaken: string[],
  cppExperience: string,
  javaExperience: string,
  level: string,
  leetcodeRating: number,
  pythonExperience: string,
  student: string,
}

const Experience: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('');
  const [experience, setExperience] = useState<Experiences>({
    cExperience: 'none',
    codeforcesRating: 0,
    contestExperience: 0,
    coursesTaken: [],
    cppExperience: 'none',
    javaExperience: 'none',
    level: '',
    leetcodeRating: 0,
    pythonExperience: 'none',
    student: '',
  });

  const handleOpen = () => {
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
  }

  const handleSelect = (event: SelectChangeEvent) => {
    setType(event.target.value);
  };

  return (
    <div className={profileStyles['inner-screen']}>
      <div className={profileStyles.title}>
        <h3>Experience</h3>
      </div>
      <hr className={pageStyles.divider}/>
      <div className={profileStyles.modal}>
        <Button variant="contained" sx={addBtn} onClick={handleOpen}>Add New Skill/Experience</Button>
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
                <MenuItem sx={{ fontSize: '14px' }} value="language">Language Proficiency</MenuItem>
                <MenuItem sx={{ fontSize: '14px' }} value="coursesTaken">Relevant Skills</MenuItem>
                <MenuItem sx={{ fontSize: '14px' }} value="contestExperience">Past Contests</MenuItem>
                <MenuItem sx={{ fontSize: '14px' }} value="leetcodeRating">LeetCode Contest Rating</MenuItem>
                <MenuItem sx={{ fontSize: '14px' }} value="codeforcesRating">Codeforces Contest Rating</MenuItem>
              </Select>
            </FormControl>
            <hr className={pageStyles.divider}/>
        </Paper>}
      </div>
    </div>
  );
}

export default Experience;

