'use client';

// import { useEffect, useState } from 'react';
import profileStyles from '@/styles/Profile.module.css';
import pageStyles from '@/styles/Page.module.css';
import { IconButton } from '@mui/material';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
// import { ProfileProps } from '../page';

const AccountSettings: React.FC = () => {
  return (
    <div className={profileStyles['inner-screen']}>
      <div className={profileStyles.title}>
        <h3>Account Settings</h3>
        <IconButton>
          <EditTwoToneIcon />
        </IconButton>
      </div>
      <hr className={pageStyles.divider}/>
      <p>(Currently not implemented)</p>
    </div>
  );
}

export default AccountSettings;

