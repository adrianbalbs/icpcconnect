'use client';

import { useState } from 'react';
import styles from '@/styles/Profile.module.css';
import Dropdown from './Dropdown';
import { Avatar, IconButton, Tooltip } from '@mui/material';

const Menu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return <div className={styles.menu}>
    <Tooltip title="Account profile">
      <IconButton onClick={handleClick} sx={{ height: '55px', width: '55px' }}>
        <Avatar>Y</Avatar>
      </IconButton>
    </Tooltip>
    <div className={styles['pfp-label']}>
      <p className={styles['pfp-role']}>Student</p>
      <p>Yian Li</p>
    </div>
    <Dropdown anchorEl={anchorEl} open={open} handleClose={handleClose}/>
  </div>;
}

export default Menu;