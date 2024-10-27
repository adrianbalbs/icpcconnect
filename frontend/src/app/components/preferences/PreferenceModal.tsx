import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { addBtn, addExperienceBtn, addModal } from '@/styles/sxStyles';
import pageStyles from '@/styles/Page.module.css';
import experienceStyles from '@/styles/Experience.module.css';
import { Button, FormControl, InputLabel, MenuItem, Paper, Select, SelectChangeEvent } from '@mui/material';
import CloseBtn from '../utils/CloseBtn';
import { PreferenceType } from '@/profile/[id]/preferences/page';
import TeamInput from './TeamInput';
import PairInput from './PairInput';
import ExclusionInput from './ExclusionInput';

interface ModalProps {
  added: PreferenceType;
  setAdded: Dispatch<SetStateAction<PreferenceType>>;
}

const PreferenceModal: React.FC<ModalProps> = ({ added, setAdded }) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('');
  const [disable, setDisable] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
    setType('');
    setDisable(false);
  }

  const handleSelect = (event: SelectChangeEvent) => {
    if (event.target.value === 'language') setDisable(false);
    setType(event.target.value);
  };

  const addPreference = () => {
    const newAdded = { ...added, [type]: true }
    setAdded(newAdded);
    handleClose();
  }

  useEffect(() => {
    if (buttonRef.current) {
        buttonRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}, [type]);

  return (
    <div className={experienceStyles.modal}>
      {!open && <Button variant="contained" sx={addExperienceBtn} onClick={handleOpen}>Add New Preference</Button>}
      {open && <Paper square elevation={3} sx={addModal}>
        <CloseBtn handleClose={handleClose}/>
        <FormControl sx={{ margin: '10px 20px 25px', fontSize: '12px', width: 'calc(100% - 40px)' }} >
          <InputLabel id="new-preference-label" sx={{ lineHeight: '15px', fontSize: '14px' }}>New Preference</InputLabel>
            <Select
              id="select-type"
              value={type}
              label="New Preference"
              sx={{ height: '45px', fontSize: '14px' }}
              onChange={handleSelect}
            >
              {!added.team && <MenuItem sx={{ fontSize: '14px' }} value="team">Team Preference: &nbsp;already have two teammates</MenuItem>}
              {!added.pair && <MenuItem sx={{ fontSize: '14px' }} value="pair">Pair Preference: &nbsp;have one other teammate</MenuItem>}
              {!added.exclusions && <MenuItem sx={{ fontSize: '14px' }} value="exclusions">Exclusion Preference: &nbsp;don't want someone</MenuItem>}
            </Select>
          </FormControl>
          <hr className={pageStyles.divider}/>
          {type === 'team' && <TeamInput setDisable={setDisable} />}
          {type === 'pair' && <PairInput setDisable={setDisable} />}
          {type === 'exclusions' && <ExclusionInput setDisable={setDisable} />}
          {type && <Button variant="contained" sx={addBtn} onClick={addPreference} ref={buttonRef} disabled={disable}>Add</Button>}
      </Paper>}
    </div>
  );
}

export default PreferenceModal;
