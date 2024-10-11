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
  const role = 'admin';
  const [notif, setNotif] = useState({ type: '', name: '' });

  useEffect(() => {
    if (localStorage.getItem('role') === null) {
      router.replace('/login');
    }
  }, []);

  return <>
    <Notif visible={notif.type !== ''} notif={notif} setNotif={setNotif} />
    <div className={pageStyles.screen}>
      {role === 'admin' && <InviteCode setNotif={setNotif} />}
      {role === 'admin' && <SiteCoordinators />}
      {(role === 'admin' || role === 'site_coordinator') && <Coaches />}
      <Students />
    </div>
  </>
}

export default Members;
