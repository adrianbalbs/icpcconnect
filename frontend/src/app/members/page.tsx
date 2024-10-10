'use client';

import { useState } from 'react';
import pageStyles from '@/styles/Page.module.css';
import SiteCoordinators from '@/components/members/SiteCoordinators';
import Coaches from '@/components/members/Coaches';
import Students from '@/components/members/Students';
import Notif from '@/components/utils/Notif';
import InviteCode from '@/components/utils/InviteCode';

const Members: React.FC = () => {
  // const [role, setRole] = useState(0);
  const [notif, setNotif] = useState({ type: '', name: '' });

  return <>
    <Notif visible={notif.type !== ''} notif={notif} setNotif={setNotif} />
    <div className={pageStyles.screen}>
      {<InviteCode setNotif={setNotif} />}
      {<SiteCoordinators />}
      {<Coaches />}
      <Students />
    </div>
  </>
}

export default Members;
