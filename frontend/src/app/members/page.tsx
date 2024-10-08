'use client';

import { useState } from 'react';
import pageStyles from '../styles/Page.module.css';
import SiteCoordinators from '../components/members/SiteCoordinators';
import Coaches from '../components/members/Coaches';
import Students from '../components/members/Students';

const Members: React.FC = () => {
  const [role, setRole] = useState(0);

  return <>
    <div className={pageStyles.screen}>
      {role === 0 && <SiteCoordinators />}
      {role <= 1 && <Coaches />}
      <Students />
    </div>
  </>
}

export default Members;
