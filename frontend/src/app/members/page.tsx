'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import pageStyles from '@/styles/Page.module.css';
import SiteCoordinators from '@/components/members/SiteCoordinators';
import Coaches from '@/components/members/Coaches';
import Students from '@/components/members/Students';
import Notif from '@/components/utils/Notif';
import InviteCode from '@/components/utils/InviteCode';

const Members: React.FC = () => {
  const router = useRouter();
  // const [role, setRole] = useState(0);
  const [notif, setNotif] = useState({ type: '', name: '' });

  if (localStorage.getItem('token') === null) {
    router.replace('/login');
  }

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
