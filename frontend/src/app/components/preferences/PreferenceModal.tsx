import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { addBtn, addExperienceBtn, addModal } from '@/styles/sxStyles';
import pageStyles from '@/styles/Page.module.css';
import experienceStyles from '@/styles/Experience.module.css';
import { Button, FormControl, InputLabel, MenuItem, Paper, Select, SelectChangeEvent } from '@mui/material';
import CloseBtn from '../utils/CloseBtn';
import { PreferenceInput, PreferenceType } from '@/profile/[id]/preferences/page';
import TeamInput from './modalInput/TeamInput';
import PairInput from './modalInput/PairInput';
import ExclusionInput from './modalInput/ExclusionInput';
import TeamPairAlert from './modalInput/TeamPairAlert';
import { capitalise } from '@/utils/profileInfo';

interface ModalProps {
  added: PreferenceType;
  setAdded: Dispatch<SetStateAction<PreferenceType>>;
  preferences: PreferenceInput;
  setPreferences: Dispatch<SetStateAction<PreferenceInput>>;
}

const PreferenceModal: React.FC<ModalProps> = ({ added, setAdded, preferences, setPreferences }) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('');
  const [disable, setDisable] = useState(false);
  const [alert, setAlert] = useState({ old: '', curr: '' });
  const [team, setTeam] = useState(preferences.team);
  const [pair, setPair] = useState(preferences.pair);
  const [exclude, setExclude] = useState('');

  const reset = () => {
    setTeam(preferences.team);
    setPair(preferences.pair);
    setExclude('');
  }

  const handleOpen = () => {
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
    setType('');
    setDisable(false);
    setAlert({ old: '', curr: '' });
    reset();
  }

  const handleSelect = (event: SelectChangeEvent) => {
    const newType = event.target.value;
    setType(newType);
    setAlert({ old: '', curr: '' });
    if (newType === 'team' && added.pair) {
      setAlert({ old: 'pair', curr: 'team' });
    } else if (newType === 'pair' && added.team) {
      setAlert({ old: 'team', curr: 'pair' });
    }
    reset();
  };

  const addPreference = () => {
    let exclusions = [ ...preferences.exclusions ];
    if (exclude !== '') {
      // Make sure start of first/last names are capitalised
      const split = exclude.split(' ');
      exclusions = [ ...exclusions, split.map(n => capitalise(n)).join(' ') ];
    }
    setAdded({ ...added, [type]: true });
    setPreferences({ team, pair, exclusions });
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
        <FormControl sx={{ margin: '10px 20px 7px', fontSize: '12px', width: 'calc(100% - 40px)' }} >
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
              <MenuItem sx={{ fontSize: '14px' }} value="exclusions">Exclusion Preference: &nbsp;don&apos;t want someone</MenuItem>
            </Select>
          </FormControl>
          <TeamPairAlert { ...alert }/>
          <hr className={pageStyles.divider}/>
          {type === 'team' && <TeamInput setDisable={setDisable} alert={alert.curr !== ''} setPref={setTeam} />}
          {type === 'pair' && <PairInput setDisable={setDisable} alert={alert.curr !== ''} setPref={setPair} />}
          {type === 'exclusions' && <ExclusionInput setDisable={setDisable} setPref={setExclude} />}
          {type && <Button variant="contained" sx={addBtn} onClick={addPreference} ref={buttonRef} disabled={disable}>Add</Button>}
      </Paper>}
    </div>
  );
}

export default PreferenceModal;
