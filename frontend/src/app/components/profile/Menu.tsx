'use client';

import { useEffect, useState } from 'react';
import styles from '@/styles/Profile.module.css';
import Dropdown from './Dropdown';
import { Avatar, IconButton, Tooltip } from '@mui/material';
import { getInfo } from '@/utils/profileInfo';

const Menu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [info, setInfo] = useState({ role: '', name: '' });

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const storeInfo = async () => {
    const data = await getInfo(localStorage.getItem('id'));
    if (data !== undefined) {
      setInfo({ role: data.sideInfo.role, name: data.sideInfo.name });
    }
  }

  useEffect(() => {
    storeInfo();
  }, []);

  return <div className={styles.menu}>
    <Tooltip title="Account profile">
      <IconButton onClick={handleClick} sx={{ height: '55px', width: '55px' }}>
        <Avatar>{info.name.charAt(0)}</Avatar>
      </IconButton>
    </Tooltip>
    <div className={styles['pfp-label']}>
      <p className={styles['pfp-role']}>{info.role}</p>
      <p>{info.name}</p>
    </div>
    <Dropdown anchorEl={anchorEl} open={open} handleClose={handleClose}/>
  </div>;
}

export default Menu;